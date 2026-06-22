import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import CandidateDetail from "@/components/tuyen-dung/CandidateDetail"

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerClient()

  const { data: candidate, error } = await supabase
    .from("candidates")
    .select(`
      *,
      job_postings(id, title, required_exp_years),
      interview_slots(*),
      interview_sessions(*, interview_evaluations(*, interviewers(*)))
    `)
    .eq("id", id)
    .single()

  if (error || !candidate) notFound()

  const { data: interviewers } = await supabase.from("interviewers").select("*").eq("is_active", true)

  return <CandidateDetail candidate={candidate as never} interviewers={interviewers || []} />
}
