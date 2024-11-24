"use client";
import { useUser } from "@/data/provider"; // Importando useUser
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Input,
  Layout,
  Notification,
  Page,
  SavebarTrigger,
} from "design-system-zeroz";
import { useCurrentUser } from "@/hooks/user-current-user";
import { settings } from "@/actions/settings";
import { SettingsSchema } from "@/schemas/index";

interface FormValues {
  name?: string | undefined;
  email?: string | undefined;
  username?: string | undefined;
}

const SettingsPage = () => {
  const { userData, setUserData } = useUser();
  const user = useCurrentUser();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const { update } = useSession();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [hasFormChanged, setHasFormChanged] = useState(false);
  const { handleSubmit, setValue, watch, reset } = useForm<
    z.infer<typeof SettingsSchema>
  >({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      password: undefined,
      newPassword: undefined,
      name: user?.name || undefined,
      email: user?.email || undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    settings(values)
      .then((data) => {
        if (data.error) {
          setError(data.error);
        }
        if (data.success) {
          update();
          setSuccess(data.success);
          setNotificationOpen(true);

          if (userData) {
            setUserData({
              ...userData,
              user: {
                ...userData.user,
                name: values.name || userData.user.name,
                email: values.email || userData.user.email,
              },
            });
          }

          setTimeout(() => {
            setNotificationOpen(false);
          }, 5000);
        }
      })
      .catch(() => setError("Something went wrong!"));
  };

  const watchedValues: FormValues = watch();

  const initialValues = useMemo(
    () => ({
      name: user?.name || undefined,
      email: user?.email || undefined,
      username: user?.username || undefined,
    }),
    [user],
  );

  useEffect(() => {
    const formChanged = Object.keys(initialValues).some(
      (key) =>
        watchedValues[key as keyof FormValues] !==
        initialValues[key as keyof FormValues],
    );
    setHasFormChanged(formChanged);
  }, [watchedValues, initialValues]);

  const handleInputChange = (fieldName: keyof FormValues, value: string) => {
    setValue(fieldName, value);
  };

  const handleCancel = () => {
    reset(initialValues);
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
          handleSubmit={handleSubmit(onSubmit)}
          formChanged={hasFormChanged}
          handleCancel={handleCancel}
        >
          <Layout columns="2 - Symmetric">
            <Input
              label="Nome"
              value={watchedValues.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
            <Input
              disabled
              label="Email"
              value={watchedValues.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
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
