import { Button, Spinner } from "@fluentui/react";
import { User } from "oidc-client-ts";
import { useEffect, useState } from "react";
import { AuthProvider, hasAuthParams, useAuth } from "react-oidc-context";

interface WrapperProps {
  children?: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps): JSX.Element => {
  const auth = useAuth();
  const [hasTriedSignin, setHasTriedSignin] = useState(false);

  useEffect(() => {
    if (!hasAuthParams() && !auth.isAuthenticated && !auth.activeNavigator && !auth.isLoading && !hasTriedSignin) {
      auth.signinRedirect();
      setHasTriedSignin(true);
    }
  }, [auth, hasTriedSignin]);

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <Spinner />;
  }

  if (auth.error) {
    if (auth.error.message === "Session not active") {
      auth.signinRedirect();
      return <Spinner />;
    }
    return (
      <>
        {auth.error.message}
        <Button onClick={() => auth.signinRedirect()}>Try Again</Button>
      </>
    );
  }

  if (auth.isAuthenticated) {
    return <>{children}</>;
  }

  return <>Unauthorised</>;
};

interface GitLabAuthProviderProps {
  children?: React.ReactNode;
}

export const GitLabAuthProvider = ({ children }: GitLabAuthProviderProps): JSX.Element => {
  return (
    <AuthProvider
      authority={`${process.env.GITLAB_AUTH_PROVIDER_AUTHORITY}`}
      client_id={`${process.env.GITLAB_AUTH_PROVIDER_CLIENT_ID}`}
      redirect_uri={`${window.location.protocol}//${window.location.hostname}${
        window.location.port ? ":" + window.location.port : ""
      }/word-add-in`}
      onSigninCallback={(_user: User | void): void => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }}
      scope="openid read_api read_repository"
    >
      <Wrapper>{children}</Wrapper>
    </AuthProvider>
  );
};
