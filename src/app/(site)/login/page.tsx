import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="container-app max-w-md py-16">
      <h1 className="mb-6 text-center font-heading text-2xl font-bold text-brand-navy">Login</h1>
      <LoginForm />
    </div>
  );
}
