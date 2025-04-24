interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

export default function Select({ children, ...props }: SelectProps) {
  return (
    <select
      className="border rounded px-2 py-1"
      {...props}
    >
      {children}
    </select>
  )
}
