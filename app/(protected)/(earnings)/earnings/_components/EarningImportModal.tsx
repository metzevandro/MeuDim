import {
  Badge,
  Button,
  Checkbox,
  ContentModal,
  FileUploader,
  FooterModal,
  Modal,
  ProgressIndicator,
} from "design-system-zeroz";
import { useState } from "react";
import { parseNubankAccountStatementCsv } from "@/lib/account-statement";
import { applyEarningRules } from "../_utils/apply-rules";
import {
  EarningImportResult,
  EarningImportTransaction,
  EarningRule,
  fetchAllIncomeSources,
  fetchEarningRules,
  IncomeSourceOption,
  submitEarningImport,
} from "../_utils/import-api";
import EarningImportTable, { EarningRowPatch } from "./EarningImportTable";

import "./EarningImportModal.scss";

type ImportStep = "upload" | "preview" | "done";

const STEPS: { key: Exclude<ImportStep, "done">; label: string }[] = [
  { key: "upload", label: "Arquivo" },
  { key: "preview", label: "Revisão" },
];

const TRANSITION_MS = 200;

const EXPECTED_COLUMNS = "Data, Valor e Descrição";
const IGNORED_HINT = "Pix no crédito ou resgates de investimento, que não são ganhos";

const count = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

interface ModalProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  onImported?: () => void;
}

export function EarningImportModal(props: ModalProps) {
  const { modalOpen, setModalOpen, onImported } = props;

  const [step, setStep] = useState<ImportStep>("upload");
  const [stepVisible, setStepVisible] = useState(true);
  const [fileList, setFileList] = useState<FileList | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [transactions, setTransactions] = useState<EarningImportTransaction[]>(
    [],
  );
  const [incomeSources, setIncomeSources] = useState<IncomeSourceOption[]>([]);
  const [rememberChoices, setRememberChoices] = useState(true);
  const [importResult, setImportResult] = useState<EarningImportResult | null>(
    null,
  );

  const readyRows = transactions.filter(
    (t) => t.status === "PENDING" && t.incomeSourceId,
  );
  const suggestedCount = transactions.filter((t) => t.origin === "RULE").length;
  const ignoredCount = transactions.filter(
    (t) => t.status === "IGNORED",
  ).length;
  const pendingCount = transactions.filter(
    (t) => t.status === "PENDING" && !t.incomeSourceId,
  ).length;

  const currentStepIndex =
    step === "done" ? STEPS.length : STEPS.findIndex((s) => s.key === step);

  const resetFlow = () => {
    setStep("upload");
    setStepVisible(true);
    setFileList(null);
    setFileError(null);
    setTransactions([]);
    setIncomeSources([]);
    setRememberChoices(true);
    setImportResult(null);
  };

  const handleModal = () => {
    if (modalOpen) {
      if (step === "done") onImported?.();
      resetFlow();
    }
    setModalOpen(!modalOpen);
  };

  const goToStep = (nextStep: ImportStep, after?: () => void) => {
    setStepVisible(false);
    setTimeout(() => {
      after?.();
      setStep(nextStep);
      setStepVisible(true);
    }, TRANSITION_MS);
  };

  const handleBackToUpload = () => {
    setFileError(null);
    goToStep("upload", () => setTransactions([]));
  };

  const handleFileChange = (files: FileList | null) => {
    setFileError(null);

    const file = files?.[0];
    if (file && !file.name.toLowerCase().endsWith(".csv")) {
      setFileError(
        "Não reconhecemos esse formato. Confira se é o CSV exportado direto do app do banco.",
      );
      setFileList(null);
      return;
    }

    setFileList(files);
  };

  const handleContinueFromUpload = async () => {
    const file = fileList?.[0];
    if (!file) return;

    setIsParsing(true);
    setFileError(null);
    try {
      const [text, sources, rules] = await Promise.all([
        file.text(),
        fetchAllIncomeSources(),
        fetchEarningRules(),
      ]);

      const parsed: EarningImportTransaction[] = parseNubankAccountStatementCsv(
        text,
        "IN",
      ).map((t) => ({
        id: t.id,
        date: t.date,
        title: t.title,
        amount: t.amount,
        status: t.status,
        ignoredReason: t.ignoredReason,
        incomeSourceId: null,
        origin: "NONE",
      }));

      if (parsed.length === 0) {
        throw new Error("Não encontramos entradas nesse extrato.");
      }

      setIncomeSources(sources);
      setTransactions(
        applyEarningRules(parsed, rules as EarningRule[], sources),
      ); // <- autopreenchimento
      goToStep("preview");
    } catch (err) {
      setFileError(
        err instanceof Error ? err.message : "Erro ao processar o arquivo.",
      );
    } finally {
      setIsParsing(false);
    }
  };

  const handleRowChange = (id: string, patch: EarningRowPatch) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch, origin: "MANUAL" } : t)),
    );
  };

  const handleConfirmImport = async () => {
    if (readyRows.length === 0) return;

    setIsSaving(true);
    setFileError(null);
    try {
      const result = await submitEarningImport(
        readyRows.map((t) => ({
          importKey: t.id,
          date: t.date.toISOString(),
          title: t.title,
          amount: t.amount,
          incomeSourceId: t.incomeSourceId!,
          learn: rememberChoices && t.origin === "MANUAL",
        })),
      );
      setImportResult(result);
      goToStep("done");
    } catch (err) {
      setFileError(
        err instanceof Error ? err.message : "Erro ao importar os ganhos.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={step === "preview" ? "transactions-import-preview" : ""}>
      <Modal
        title="Importar extrato da conta"
        description={
          step === "upload"
            ? "Envie o CSV do extrato da conta exportado pelo app do banco. Só as entradas viram ganhos."
            : step === "preview"
              ? "Revise e complete as linhas. Nada é importado até você confirmar."
              : "Importação concluída."
        }
        isOpen={modalOpen}
        hideModal={handleModal}
        dismissible
        content={
          <ContentModal>
            <div
              className="earning-import-steps"
              aria-label="Etapas da importação"
            >
              {STEPS.map((item, index) => (
                <ProgressIndicator
                  key={item.key}
                  step={`Etapa ${index + 1}`}
                  description={item.label}
                  state={
                    index < currentStepIndex
                      ? "completed"
                      : index === currentStepIndex
                        ? "current"
                        : "default"
                  }
                  direction="row"
                  widthFull
                />
              ))}
            </div>
            <div
              style={{
                opacity: stepVisible ? 1 : 0,
                transform: stepVisible ? "translateY(0)" : "translateY(4px)",
                transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
              }}
            >
              {step === "upload" && (
                <div className="earning-import-upload">
                  <FileUploader
                    title="Selecione o CSV do extrato"
                    description="Exporte o extrato da conta direto do app do seu banco e envie aqui. Nada é lançado automaticamente — você confirma tudo na próxima etapa."
                    buttonLabel="Escolher arquivo"
                    typeIconButton="upload_file"
                    accept=".csv,text/csv"
                    maxFileSize={10}
                    value={fileList}
                    onChange={handleFileChange}
                  />
                  <small>Colunas esperadas no CSV: {EXPECTED_COLUMNS}.</small>
                </div>
              )}

              {step === "preview" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--s-spacing-x-small)",
                  }}
                >
                  <div className="earning-import-summary">
                    <div className="earning-import-summary-badges">
                      <Badge
                        label={count(
                          transactions.length,
                          "encontrada",
                          "encontradas",
                        )}
                        type="light"
                        variant="default"
                      />
                      <Badge
                        label={count(readyRows.length, "pronta", "prontas")}
                        type="light"
                        variant="success"
                      />
                      {pendingCount > 0 && (
                        <Badge
                          label={count(pendingCount, "pendente", "pendentes")}
                          type="light"
                          variant="default"
                        />
                      )}
                      {suggestedCount > 0 && (
                        <Badge
                          label={count(suggestedCount, "sugerida", "sugeridas")}
                          type="light"
                          variant="primary"
                        />
                      )}
                      {ignoredCount > 0 && (
                        <Badge
                          label={count(ignoredCount, "ignorada", "ignoradas")}
                          type="light"
                          variant="warning"
                        />
                      )}
                    </div>
                    <small>
                      Linhas sem fonte de renda não serão importadas; você pode
                      importar o resto depois.
                      {suggestedCount > 0 &&
                        " Sugeridas vêm do que você ensinou em importações anteriores."}
                      {ignoredCount > 0 && ` Ignoradas: ${IGNORED_HINT}.`}
                    </small>
                  </div>

                  {incomeSources.length === 0 && (
                    <small style={{ color: "var(--s-color-content-warning)" }}>
                      Você ainda não tem fontes de renda cadastradas. Cadastre
                      uma em &ldquo;Fonte de renda&rdquo; antes de importar.
                    </small>
                  )}

                  <EarningImportTable
                    transactions={transactions}
                    incomeSources={incomeSources}
                    onChange={handleRowChange}
                  />

                  <div style={{ width: "fit-content" }}>
                    <Checkbox
                      label="Lembrar a fonte de renda para preencher automaticamente nas próximas importações"
                      modelValue={rememberChoices}
                      onUpdate={setRememberChoices}
                    />
                  </div>
                </div>
              )}

              {step === "done" && importResult && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--s-spacing-xx-small)",
                    minWidth: "280px",
                  }}
                >
                  <strong>
                    {importResult.imported} ganho
                    {importResult.imported === 1 ? "" : "s"} importado
                    {importResult.imported === 1 ? "" : "s"}.
                  </strong>
                  {importResult.duplicates > 0 && (
                    <small>
                      {importResult.duplicates} já existia
                      {importResult.duplicates === 1 ? "" : "m"} e foi ignorado
                      {importResult.duplicates === 1 ? "" : "s"}.
                    </small>
                  )}
                  {importResult.rulesLearned > 0 && (
                    <small>
                      Aprendi {importResult.rulesLearned} descrição
                      {importResult.rulesLearned === 1 ? "" : "ões"} — na
                      próxima importação elas já vêm preenchidas.
                    </small>
                  )}
                </div>
              )}

              {fileError && (
                <p
                  style={{
                    color: "var(--s-color-content-warning)",
                    fontSize: 14,
                    marginTop: "var(--s-spacing-x-small)",
                  }}
                >
                  {fileError}
                </p>
              )}
            </div>
          </ContentModal>
        }
        footer={
          step === "upload" ? (
            <FooterModal>
              <div
                style={{
                  display: "flex",
                  width: "fit-content",
                  gap: "var(--s-spacing-xx-small)",
                }}
              >
                <Button
                  onClick={handleContinueFromUpload}
                  disabled={!fileList || !!fileError}
                  isLoading={isParsing}
                >
                  Continuar
                </Button>
              </div>
            </FooterModal>
          ) : step === "preview" ? (
            <FooterModal>
              <div
                style={{
                  display: "flex",
                  width: "fit-content",
                  gap: "var(--s-spacing-xx-small)",
                }}
              >
                <Button
                  onClick={handleConfirmImport}
                  disabled={readyRows.length === 0}
                  isLoading={isSaving}
                >
                  {`Importar ${readyRows.length} ganho${
                    readyRows.length === 1 ? "" : "s"
                  }`}
                </Button>
                <Button variant="secondary" onClick={handleBackToUpload}>
                  Voltar
                </Button>
              </div>
            </FooterModal>
          ) : step === "done" ? (
            <FooterModal>
              <Button onClick={handleModal}>Concluir</Button>
            </FooterModal>
          ) : undefined
        }
      />
    </div>
  );
}
