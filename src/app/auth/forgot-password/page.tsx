import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function ForgotPasswordPage() {
  return <AuthLayout title="Reset your password" description="Enter your work email and we will send secure reset instructions."><form className="auth-form"><label className="auth-field"><span>Email address</span><div className="auth-input-wrap"><input required type="email" autoComplete="email" placeholder="Enter your email" style={{paddingLeft:"1rem"}} /></div></label><button className="auth-submit" type="submit">Send reset link</button><p className="auth-account-copy"><Link href="/auth/signin">Return to sign in</Link></p></form></AuthLayout>;
}
