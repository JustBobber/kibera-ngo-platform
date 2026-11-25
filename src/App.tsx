import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router"
import { Layout } from "@/components/Layout"
import { Loading, Page } from "@/components/Page"
import { HomePage } from "@/pages/HomePage"
import { NgoDetailPage } from "@/pages/NgoDetailPage"
import { NgosPage } from "@/pages/NgosPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { ProjectDetailPage } from "@/pages/ProjectDetailPage"
import { ProjectsPage } from "@/pages/ProjectsPage"

// Pages that most visitors never open are downloaded only when needed.
// This keeps the first load small on slow mobile connections.
// The map page is split out because Leaflet is heavy.
const MapPage = lazy(() => import("@/pages/MapPage"))
const LoginPage = lazy(() => import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import("@/pages/SignupPage").then((m) => ({ default: m.SignupPage })))
const DashboardPage = lazy(() => import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })))
const AdminPage = lazy(() => import("@/pages/AdminPage").then((m) => ({ default: m.AdminPage })))
const NgoEditPage = lazy(() => import("@/pages/NgoEditPage").then((m) => ({ default: m.NgoEditPage })))
const NewProjectPage = lazy(() => import("@/pages/ProjectFormPage").then((m) => ({ default: m.NewProjectPage })))
const EditProjectPage = lazy(() => import("@/pages/ProjectFormPage").then((m) => ({ default: m.EditProjectPage })))

export function App() {
  return (
    <Suspense fallback={<Page><Loading /></Page>}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/new" element={<NewProjectPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="projects/:id/edit" element={<EditProjectPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="organizations" element={<NgosPage />} />
          <Route path="organizations/:id" element={<NgoDetailPage />} />
          <Route path="organizations/:id/edit" element={<NgoEditPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
