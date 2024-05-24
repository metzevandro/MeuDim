import { auth } from "@/auth";

export const currentUser = async () => {
  const session = await auth();

  return session?.user;
};

export const currentRole = async () => {
  const session = await auth();
  const user = session?.user;

  if (user && "role" in user) {
    return user.role;
  } else {
    return null;
  }
};
