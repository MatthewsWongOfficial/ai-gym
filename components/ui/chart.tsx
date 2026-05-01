import React from "react"

export const PieChart = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full h-full">{children}</div>
}

export const Pie = ({
  data,
  cx,
  cy,
  outerRadius,
  fill,
  dataKey,
  children,
}: {
  data: any[]
  cx: string
  cy: string
  outerRadius: number
  fill: string
  dataKey: string
  children: React.ReactNode
}) => {
  // Create a simple pie chart visualization
  const childArray = React.Children.toArray(children)
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 200">
      <g transform="translate(100, 100)">
        {data.map((entry, index) => {
          const startAngle = index * (360 / data.length)
          const endAngle = (index + 1) * (360 / data.length)
          const pathData = describeArc(0, 0, outerRadius, startAngle, endAngle)
          const child = childArray[index]
          const fillColor = React.isValidElement<{ fill: string }>(child) ? child.props.fill : fill
          return <path key={index} d={pathData} fill={fillColor} stroke="#333" strokeWidth="1" />
        })}
      </g>
    </svg>
  )
}

// Helper function to create SVG arc path
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
  return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y, "L", x, y, "Z"].join(" ")
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

export const Cell = ({ fill }: { fill: string }) => {
  return <rect fill={fill} width="20" height="20" />
}

export const ResponsiveContainer = ({
  width,
  height,
  children,
}: { width: string; height: string; children: React.ReactNode }) => {
  return (
    <div style={{ width, height }} className="mx-auto">
      {children}
    </div>
  )
}

export const Legend = ({ formatter }: { formatter?: (value: string) => React.ReactNode }) => {
  return (
    <div className="flex justify-center mt-4 gap-4">
      <div className="flex items-center">
        <div className="w-3 h-3 bg-emerald-500 mr-2"></div>
        {formatter ? formatter("Protein") : <span>Protein</span>}
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 bg-indigo-500 mr-2"></div>
        {formatter ? formatter("Carbs") : <span>Carbs</span>}
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 bg-amber-500 mr-2"></div>
        {formatter ? formatter("Fat") : <span>Fat</span>}
      </div>
    </div>
  )
}

export const Tooltip = ({ content }: { content?: React.ReactNode }) => {
  return content || null
}

