"use client";
import { useUser } from "@/data/provider";
import { useEffect, useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Input,
  Layout,
  Notification,
  Page,
  SavebarTrigger,
} from "design-system-zeroz";
import { SettingsSchema } from "@/schemas";
import { settings } from "@/actions/settings";

const API = process.env.NEXT_PUBLIC_APP_URL;

const SettingsPage = () => {
  const { userData, setUserData, skeleton } = useUser();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [formValues, setFormValues] = useState({
    name: userData?.user?.name ?? "",
    email: userData?.user?.email ?? "",
  });

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: formValues,
  });

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/auth/session`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await response.json();
      setUserData(userData);
    } catch (error) {
      console.log(error);
    }
  }, [setUserData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (userData?.user) {
      const updatedValues = {
        name: userData.user.name ?? "",
        email: userData.user.email ?? "",
      };
      setFormValues(updatedValues);
      form.reset(updatedValues);
    }
  }, [userData, form]);

  const formChanged = form.watch("name") !== formValues.name;

  const handleCancel = () => {
    form.reset(formValues); // Reset para os valores iniciais
  };

  const atualizarSettings = async () => {
    try {
      const settingsValues = {
        ...form.getValues(),
      };
      const data = await settings(settingsValues);

      if (data.error) {
        setError(data.error ?? "");
        setSuccess("");
        setNotificationOpen(true);
      } else {
        setError("");
        setSuccess(data.success ?? "");
        setNotificationOpen(true);
        fetchUserData();
      }
    } catch (error) {
      setError("Ocorreu um erro ao atualizar as configurações.");
    }
  };

  return (
    <>
      <Page
        buttonContentPrimary="Button"
        buttonContentSecondary="Button"
        namePage="Conta"
      >
        <SavebarTrigger
          label="Salvar"
          labelCancel="Cancelar"
          labelSave="Salvar"
          handleSubmit={atualizarSettings}
          formChanged={formChanged}
          handleCancel={handleCancel}
        >
          <Layout columns="2 - Symmetric">
            <Input
              skeleton={skeleton}
              label="Nome"
              value={form.watch("name")}
              onChange={(e) =>
                form.setValue("name", e.target.value, { shouldDirty: true })
              }
            />
            <Input
              disabled
              skeleton={skeleton}
              label="Email"
              value={form.watch("email")}
            />
          </Layout>
        </SavebarTrigger>
      </Page>

      {success && (
        <Notification
          icon="check_circle"
          title={success}
          variant="success"
          type="float"
          isOpen={notificationOpen}
        />
      )}
      {error && (
        <Notification
          icon="warning"
          title={error}
          variant="warning"
          type="float"
          isOpen={notificationOpen}
        />
      )}
    </>
  );
};

export default SettingsPage;
