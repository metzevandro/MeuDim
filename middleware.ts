import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return; 
  }

  if (isLoggedIn) {
    if (isAuthRoute || nextUrl.pathname === "/") {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
    }
  } 

  if (!isLoggedIn) {
    if (!isPublicRoute || nextUrl.pathname === "/") {
      return Response.redirect(new URL("/auth/login", req.url));
    }
  }

  return;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
