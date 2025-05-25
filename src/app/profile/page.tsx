import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Профіль</h1>
        <p className="mb-2">Ім’я: {session.user.name}</p>
        <p className="mb-2">Email: {session.user.email}</p>
        <p className="text-sm text-gray-500 mt-4">Ви увійшли успішно ✅</p>
      </div>
    </div>
  );
}
