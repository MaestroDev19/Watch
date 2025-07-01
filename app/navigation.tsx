import { Nav, PrivateNav } from "@/components/navbar";
import { getUser } from "@/lib/actions";

export default async function Navigation() {
  const user = await getUser();
  if (user) {
    return <PrivateNav user={user ?? "Guest"} />;
  }
  return <Nav />;
}
