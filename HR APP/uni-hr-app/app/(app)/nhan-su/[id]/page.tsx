import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import EmployeeProfileClient from "@/components/nhan-su/EmployeeProfile/index"

export default async function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerClient()

  const { data: employee, error } = await supabase
    .from("employees")
    .select(`
      *,
      employee_documents(*),
      hr_contract_history(*),
      teams_activity_snapshots(*)
    `)
    .eq("id", id)
    .single()

  if (error || !employee) notFound()

  // Fetch candidate record if employee was previously a candidate
  const { data: candidateRecord } = await supabase
    .from("candidates")
    .select(`
      *,
      job_postings(title),
      interview_sessions(
        *,
        interview_evaluations(*)
      )
    `)
    .eq("status", "Đã nhận việc")
    .ilike("full_name", employee.full_name)
    .maybeSingle()

  return <EmployeeProfileClient employee={employee as never} candidateRecord={candidateRecord} />
}
