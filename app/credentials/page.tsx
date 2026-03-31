import { Suspense } from "react";
import CredentialsClient from "./CredentialsClient";

export default function CredentialsPage() {
  return (
    <Suspense>
      <CredentialsClient />
    </Suspense>
  );
}
