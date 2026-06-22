import { differenceInDays, parseISO } from "date-fns"

interface Contract {
  id: string
  full_name: string
  contract_type: string | null
  contract_end_date: string | null
  office: string | null
}

export default function RenewalReminders({ contracts }: { contracts: Contract[] }) {
  const today = new Date()

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-yellow-600 text-lg">⚠️</span>
        <h3 className="font-semibold text-yellow-800">Hợp đồng sắp hết hạn ({contracts.length} người)</h3>
      </div>
      <div className="space-y-1">
        {contracts.map((c) => {
          const days = c.contract_end_date
            ? differenceInDays(parseISO(c.contract_end_date), today)
            : 0
          return (
            <div key={c.id} className="flex items-center justify-between text-sm">
              <span className="text-yellow-900 font-medium">{c.full_name}</span>
              <div className="flex items-center gap-4 text-yellow-700">
                <span>{c.contract_type}</span>
                <span>{c.office}</span>
                <span className="font-semibold">Còn {days} ngày ({c.contract_end_date})</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
