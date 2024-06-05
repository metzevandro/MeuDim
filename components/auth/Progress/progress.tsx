import { Progress } from "design-system-zeroz";

import "./Progress.scss";

interface AuthProgressProps {
  loading: number;
  error: boolean;
}

export default function AuthProgress(props: AuthProgressProps) {
  return (
    <>
      {props.loading !== 0 && (
        <div className="auth-progress">
          <Progress value={props.loading} error={props.error} />{" "}
        </div>
      )}
    </>
  );
}
