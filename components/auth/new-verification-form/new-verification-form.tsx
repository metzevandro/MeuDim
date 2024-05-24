"use client";
import "./new-verification-form.scss";
import { newVerification } from "@/actions/new-verification";
import React from "react";

import {
  Button,
  Card,
  CardContent,
  Link,
  Loading,
  Notification,
} from "design-system-zeroz";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError("Necessita de um token!");
      return;
    }

    newVerification(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
      })
      .catch(() => {
        setError("Ops! Algo deu errado.");
      });
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="card-verification">
      <Card>
        <h1>Confirme sua verificação!</h1>
        <CardContent>
          {!success && !error && <Loading variant="large" />}
          {!success && (
            <>
              {error && (
                <Notification
                  title={error}
                  type="inline"
                  variant="warning"
                  icon="warning"
                />
              )}
            </>
          )}
          {success && (
            <Notification
              title={success}
              type="inline"
              variant="success"
              icon="check_circle"
            />
          )}
          <Button size="md" variant="primary" label="Confirmar email" />
        </CardContent>
      </Card>
      <Link content="Voltar para o login" href="/auth/login" />
    </div>
  );
};
