import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PriceChartProps {
  phones: Array<{
    id: string;
    brand: string;
    model: string;
    prices: {
      proximus: number | null;
      voo: number | null;
      orange: number | null;
    };
  }>;
}

export function PriceChart({ phones }: PriceChartProps) {
  const data = phones.map(phone => ({
    name: `${phone.brand} ${phone.model}`,
    Proximus: phone.prices.proximus || null,
    VOO: phone.prices.voo || null,
    Orange: phone.prices.orange || null,
  }));

  return (
    <div className="w-full h-[400px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Proximus" fill="#004F9F" />
          <Bar dataKey="VOO" fill="#FF0000" />
          <Bar dataKey="Orange" fill="#FF7900" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
