import { useState } from "react"
import { Link, NavLink, Outlet, useNavigate } from "react-router"
import { MenuIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn("px-2 py-1 text-sm hover:underline underline-offset-4", isActive && "font-semibold underline")

export function Layout() {
  const { session, isAdmin, memberships } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  async function logOut() {
    setMenuOpen(false)
    await supabase.auth.signOut()
    navigate("/")
  }

  // Shown in the header on large screens and in the menu on small screens.
  const mainLinks = (
    <>
      <NavLink to="/projects" className={navLinkClass} onClick={() => setMenuOpen(false)}>Projects</NavLink>
      <NavLink to="/map" className={navLinkClass} onClick={() => setMenuOpen(false)}>Map</NavLink>
      <NavLink to="/organizations" className={navLinkClass} onClick={() => setMenuOpen(false)}>Organizations</NavLink>
    </>
  )

  const accountLinks = session ? (
    <>
      {(memberships.length > 0 || isAdmin) && (
        <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
      )}
      {isAdmin && (
        <NavLink to="/admin" className={navLinkClass} onClick={() => setMenuOpen(false)}>Admin</NavLink>
      )}
      <button type="button" className="px-2 py-1 text-left text-sm hover:underline underline-offset-4" onClick={logOut}>
        Log out
      </button>
    </>
  ) : (
    <NavLink to="/login" className={navLinkClass} onClick={() => setMenuOpen(false)}>Login</NavLink>
  )

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-[1000] border-b bg-violet-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-lg font-bold tracking-tight">Kibera Connect</Link>
          <nav className="hidden items-center gap-2 md:flex">
            {mainLinks}
            <span className="mx-1 h-5 w-px bg-border" />
            {accountLinks}
          </nav>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <XIcon /> : <MenuIcon />}
          </Button>
        </div>
        {menuOpen && (
          <nav className="flex flex-col gap-1 border-t px-4 py-2 md:hidden">
            {mainLinks}
            <hr className="my-1" />
            {accountLinks}
          </nav>
        )}
      </header>
      <Outlet />
    </div>
  )
}
