import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  neutralRoutes,
  publicRoutes,
} from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const { pathname, search } = nextUrl;
  const isLoggedIn = !!req.auth;
  const redirect = (to: string) => Response.redirect(new URL(to, nextUrl));

  if (pathname.startsWith(apiAuthPrefix)) return;

  if (pathname.startsWith("/api")) {
    if (isLoggedIn) return;
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (neutralRoutes.includes(pathname)) return;

  if (authRoutes.includes(pathname) || publicRoutes.includes(pathname)) {
    return isLoggedIn ? redirect(DEFAULT_LOGIN_REDIRECT) : undefined;
  }

  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname + search);
    return redirect(`/auth/login?callbackUrl=${callbackUrl}`);
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
