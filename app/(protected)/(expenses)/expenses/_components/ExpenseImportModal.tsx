import {
  Badge,
  Button,
  Checkbox,
  ContentModal,
  FileUploader,
  FooterModal,
  Icon,
  InputSelect,
  Modal,
  ProgressIndicator,
} from "design-system-zeroz";
import { useState } from "react";
import { applyRules } from "../_utils/apply-rules";
import { CreditCardTransaction, isRowReady } from "../_utils/bank-credit-card";
import {
  IMPORT_SOURCE_LIST,
  IMPORT_SOURCES,
  ImportSource,
} from "../_utils/import-sources";
import {
  CategoryOption,
  fetchAllCategories,
  fetchAllPaymentMethods,
  fetchRules,
  ImportResult,
  PaymentMethodOption,
  submitImport,
} from "../_utils/import-api";
import ExpenseImportTable, { RowPatch } from "./ExpenseImportTable";

import "./ExpenseImportModal.scss";

type ImportStep = "source" | "upload" | "preview" | "done";

const STEPS: { key: Exclude<ImportStep, "done">; label: string }[] = [
  { key: "source", label: "Origem" },
  { key: "upload", label: "Arquivo" },
  { key: "preview", label: "Revisão" },
];

const TRANSITION_MS = 200;

const count = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

const plain = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

function findCreditCardMethod(
  methods: PaymentMethodOption[],
): PaymentMethodOption | undefined {
  return (
    methods.find((m) => plain(m.name) === "cartao de credito") ??
    methods.find((m) => plain(m.name).includes("credito"))
  );
}

interface modalProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  onImported?: () => void;
}

export function ExpenseImportModal(props: modalProps) {
  const { modalOpen, setModalOpen, onImported } = props;

  const [step, setStep] = useState<ImportStep>("source");
  const [source, setSource] = useState<ImportSource>("card");
  const [selectedSource, setSelectedSource] = useState<ImportSource | null>(
    null,
  );
  const [stepVisible, setStepVisible] = useState(true);
  const [fileList, setFileList] = useState<FileList | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [transactions, setTransactions] = useState<CreditCardTransaction[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>(
    [],
  );
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const [rememberChoices, setRememberChoices] = useState(true);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const config = IMPORT_SOURCES[source];
  // "per-row": cada linha informa a forma de pagamento (extrato da conta).
  // "single": o cartão de crédito vale para todas as linhas (fatura).
  const perRowPaymentMethod = config.paymentMode === "per-row";

  const readyRows = transactions.filter(
    (t) =>
      isRowReady(t, perRowPaymentMethod) &&
      (perRowPaymentMethod || !!paymentMethodId),
  );
  const suggestedCount = transactions.filter((t) => t.origin === "RULE").length;
  const ignoredCount = transactions.filter(
    (t) => t.status === "IGNORED",
  ).length;
  const pendingCount = transactions.filter(
    (t) => t.status === "PENDING" && !isRowReady(t, perRowPaymentMethod),
  ).length;
  const currentStepIndex =
    step === "done" ? STEPS.length : STEPS.findIndex((s) => s.key === step);
  const paymentMethodName =
    paymentMethods.find((p) => p.id === paymentMethodId)?.name ?? "";

  const handleModal = () => {
    if (modalOpen) {
      if (step === "done") onImported?.();
      resetFlow();
    }
    setModalOpen(!modalOpen);
  };

  const resetFlow = () => {
    setStep("source");
    setSource("card");
    setSelectedSource(null);
    setStepVisible(true);
    setFileList(null);
    setFileError(null);
    setTransactions([]);
    setCategories([]);
    setPaymentMethods([]);
    setPaymentMethodId(null);
    setRememberChoices(true);
    setImportResult(null);
  };

  const goToStep = (nextStep: ImportStep, after?: () => void) => {
    setStepVisible(false);
    setTimeout(() => {
      after?.();
      setStep(nextStep);
      setStepVisible(true);
    }, TRANSITION_MS);
  };

  const handleContinueFromSource = () => {
    if (!selectedSource) return;
    setSource(selectedSource);
    setFileList(null);
    setFileError(null);
    goToStep("upload");
  };

  const handleBackToSource = () => {
    setFileList(null);
    setFileError(null);
    goToStep("source");
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
      const [text, cats, rules, methods] = await Promise.all([
        file.text(),
        fetchAllCategories(),
        fetchRules(),
        fetchAllPaymentMethods(),
      ]);

      const parsed = config.parse(text);
      setCategories(cats);
      setPaymentMethods(methods);
      setPaymentMethodId(
        !perRowPaymentMethod
          ? ((
              findCreditCardMethod(methods) ??
              (methods.length === 1 ? methods[0] : undefined)
            )?.id ?? null)
          : null,
      );
      setTransactions(applyRules(parsed, rules, cats));
      goToStep("preview");
    } catch (err) {
      setFileError(
        err instanceof Error ? err.message : "Erro ao processar o arquivo.",
      );
    } finally {
      setIsParsing(false);
    }
  };

  const handleRowChange = (id: string, patch: RowPatch) => {
    const teachesRule = "categoryId" in patch || "subcategoryId" in patch;
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...patch, origin: teachesRule ? "MANUAL" : t.origin }
          : t,
      ),
    );
  };

  const handleConfirmImport = async () => {
    if (readyRows.length === 0) return;

    setIsSaving(true);
    setFileError(null);
    try {
      const result = await submitImport(
        readyRows.map((t) => ({
          importKey: t.id,
          date: t.date.toISOString(),
          title: t.title,
          amount: t.amount,
          categoryId: t.categoryId!,
          subcategoryId: t.subcategoryId!,
          paymentMethodId: perRowPaymentMethod
            ? t.paymentMethodId!
            : paymentMethodId!,
          learn: rememberChoices && t.origin === "MANUAL",
        })),
      );
      setImportResult(result);
      goToStep("done");
    } catch (err) {
      setFileError(
        err instanceof Error ? err.message : "Erro ao importar as transações.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={step === "preview" ? "transactions-import-preview" : ""}>
      <Modal
        title={
          step === "source"
            ? "Importar despesas"
            : `Importar ${config.name.toLowerCase()}`
        }
        description={
          step === "source"
            ? "Escolha de onde vem o arquivo. Isso define quais linhas entram e como a forma de pagamento é preenchida."
            : step === "upload"
              ? config.modalDescription
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
              className="import-flow-steps"
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
              {step === "source" && (
                <div className="import-source">
                  <div
                    className="import-source-options"
                    role="radiogroup"
                    aria-label="Origem do arquivo"
                  >
                    {IMPORT_SOURCE_LIST.map((option) => {
                      const selected = selectedSource === option.id;
                      return (
                        <div
                          key={option.id}
                          role="radio"
                          aria-checked={selected}
                          tabIndex={0}
                          className={`import-source-option${selected ? " is-selected" : ""}`}
                          onClick={() => setSelectedSource(option.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedSource(option.id);
                            }
                          }}
                        >
                          <div className="import-source-option-header">
                            <span className="import-source-option-icon">
                              <Icon
                                icon={option.icon}
                                size="md"
                                fill={selected}
                              />
                            </span>
                            <div className="import-source-option-title">
                              <h3>{option.name}</h3>
                              <p>{option.tagline}</p>
                            </div>
                            <span
                              className="import-source-option-check"
                              aria-hidden
                            >
                              <Icon
                                icon={
                                  selected
                                    ? "check_circle"
                                    : "radio_button_unchecked"
                                }
                                size="md"
                                fill={selected}
                              />
                            </span>
                          </div>
                          <dl className="import-source-details">
                            <div>
                              <dt>Entra</dt>
                              <dd>{option.included}</dd>
                            </div>
                            <div>
                              <dt>Fica de fora</dt>
                              <dd>{option.ignored}</dd>
                            </div>
                            <div>
                              <dt>Pagamento</dt>
                              <dd>{option.paymentSummary}</dd>
                            </div>
                          </dl>
                        </div>
                      );
                    })}
                  </div>
                  <small className="import-source-help">
                    Em dúvida? Use a <strong>fatura</strong> para o que foi
                    gasto no cartão e o <strong>extrato</strong> para o que saiu
                    da conta. O pagamento da fatura que aparece no extrato é
                    ignorado, para a mesma compra não ser contada duas vezes.
                  </small>
                </div>
              )}

              {step === "upload" && (
                <div className="import-upload">
                  <FileUploader
                    title={config.uploadTitle}
                    description={config.uploadDescription}
                    buttonLabel="Escolher arquivo"
                    typeIconButton="upload_file"
                    accept=".csv,text/csv"
                    maxFileSize={10}
                    value={fileList}
                    onChange={handleFileChange}
                  />
                  <small>
                    Colunas esperadas no CSV: {config.expectedColumns}.
                  </small>
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
                  <div className="import-summary">
                    <div className="import-summary-badges">
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
                      {config.readyRule}; você pode importar o resto depois.
                      {suggestedCount > 0 &&
                        " Sugeridas vêm do que você ensinou em importações anteriores."}
                      {ignoredCount > 0 && ` Ignoradas: ${config.ignoredHint}.`}
                      {perRowPaymentMethod &&
                        " A forma de pagamento vale só para esta importação e não é lembrada nas próximas."}
                    </small>
                  </div>

                  {perRowPaymentMethod ? (
                    paymentMethods.length === 0 && (
                      <small
                        style={{ color: "var(--s-color-content-warning)" }}
                      >
                        Você ainda não tem formas de pagamento cadastradas.
                        Cadastre uma em &ldquo;Formas de pagamento&rdquo; antes
                        de importar.
                      </small>
                    )
                  ) : (
                    <>
                      {!findCreditCardMethod(paymentMethods) && (
                        <small
                          style={{ color: "var(--s-color-content-warning)" }}
                        >
                          Não encontramos uma forma de pagamento &ldquo;Cartão
                          de crédito&rdquo;. Escolha uma abaixo ou cadastre em
                          &ldquo;Formas de pagamento&rdquo;.
                        </small>
                      )}
                      {!perRowPaymentMethod &&
                        !findCreditCardMethod(paymentMethods) && (
                          <InputSelect
                            label="Forma de pagamento (todas as compras da fatura)"
                            value={paymentMethodName}
                            options={paymentMethods.map((p) => p.name)}
                            onChange={(name: string) =>
                              setPaymentMethodId(
                                paymentMethods.find((p) => p.name === name)
                                  ?.id ?? null,
                              )
                            }
                            disabled={isSaving}
                          />
                        )}
                    </>
                  )}

                  <ExpenseImportTable
                    transactions={transactions}
                    categories={categories}
                    paymentMethods={paymentMethods}
                    perRowPaymentMethod={perRowPaymentMethod}
                    onChange={handleRowChange}
                  />

                  <div style={{ width: "fit-content" }}>
                    <Checkbox
                      label="Lembrar categoria e subcategoria para preencher automaticamente nas próximas importações"
                      modelValue={rememberChoices}
                      onUpdate={setRememberChoices}
                      disabled={isSaving}
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
                    {importResult.imported} despesa
                    {importResult.imported === 1 ? "" : "s"} importada
                    {importResult.imported === 1 ? "" : "s"}.
                  </strong>
                  {importResult.duplicates > 0 && (
                    <small>
                      {importResult.duplicates} já existia
                      {importResult.duplicates === 1 ? "" : "m"} e foi ignorada
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
          step === "source" ? (
            <FooterModal>
              <Button
                onClick={handleContinueFromSource}
                disabled={!selectedSource}
              >
                Continuar
              </Button>
            </FooterModal>
          ) : step === "upload" ? (
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
                <Button
                  variant="secondary"
                  onClick={handleBackToSource}
                  disabled={isParsing}
                >
                  Voltar
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
                  {`Importar ${readyRows.length} transaç${
                    readyRows.length === 1 ? "ão" : "ões"
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
