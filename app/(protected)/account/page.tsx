"use client";
import { useUser } from "@/data/provider";
import { useCallback, useEffect, useState } from "react";
import { Input, Layout, Page, Savebar } from "design-system-zeroz";
import { accountSchema } from "@/schemas";
import { updateAccountInformation } from "@/actions/account/updateAccountInformation";
import { useNotification } from "@/hooks/useNotification";
import { AppNotification } from "@/components/notification/AppNotification";

const API = process.env.NEXT_PUBLIC_APP_URL;

function useHeaderWidth() {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(".header-root");
    if (!el) return;

    const update = () => setWidth(el.offsetWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return width;
}

const SettingsPage = () => {
  const { userData, setUserData, skeleton } = useUser();
  const headerWidth = useHeaderWidth();
  const { notification, showNotification, closeNotification } =
    useNotification();
  const [saving, setSaving] = useState(false);

  const [savedValues, setSavedValues] = useState({ name: "", email: "" });
  const [name, setName] = useState("");

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/auth/session`);

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      showNotification("Erro ao buscar dados!", true);
    }
  }, [setUserData, showNotification]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (!userData?.user) return;
    const values = {
      name: userData.user.name ?? "",
      email: userData.user.email ?? "",
    };
    setSavedValues(values);
    setName(values.name);
  }, [userData]);

  const formChanged = name !== savedValues.name;

  const handleCancel = () => {
    setName(savedValues.name);
  };

  const atualizarSettings = async () => {
    const values = { name, email: savedValues.email };
    const validatedFields = accountSchema.safeParse(values);

    if (!validatedFields.success) {
      showNotification(
        validatedFields.error.issues[0]?.message ??
          "Verifique os campos e tente novamente.",
        true,
      );
      return;
    }

    setSaving(true);
    try {
      const data = await updateAccountInformation(validatedFields.data);

      if (data?.error) {
        showNotification(data.error, true);
      } else {
        showNotification(
          data?.success ?? "Conta atualizada com sucesso!",
          false,
        );
        setSavedValues((prev) => ({ ...prev, name }));
        fetchUserData();
      }
    } catch (error) {
      showNotification("Ocorreu um erro ao atualizar as configurações.", true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Page namePage="Conta">
        <Layout columns="2 - Symmetric">
          <Input
            name="name"
            skeleton={skeleton}
            label="Nome"
            value={name}
            onChange={(e: any) => setName(e.target.value)}
          />
          <Input
            name="email"
            disabled
            skeleton={skeleton}
            label="Email"
            value={savedValues.email}
          />
        </Layout>

        {formChanged && !saving && (
          <div
            className="form-register-save-bar"
            style={headerWidth ? { width: headerWidth } : undefined}
          >
            <Savebar
              label="Você tem alterações não salvas"
              labelSave="Salvar"
              labelCancel="Cancelar"
              onClickSave={atualizarSettings}
              onClickCancel={handleCancel}
            />
          </div>
        )}
      </Page>

      <AppNotification
        isOpen={notification.open}
        message={notification.message}
        isError={notification.isError}
        onClose={closeNotification}
      />
    </>
  );
};

export default SettingsPage;
