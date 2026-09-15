import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="container-app max-w-md py-16">
      <h1 className="mb-6 text-center font-heading text-2xl font-bold text-brand-navy">Create Account</h1>
      <RegisterForm />
    </div>
  );
}
