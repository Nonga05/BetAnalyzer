import ClientApp from '@/components/ClientApp'
import { getDashboardData } from '@/lib/api-football'

export default async function Page() {
  const data = await getDashboardData()
  return <ClientApp initialData={data} />
}
