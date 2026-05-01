"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronDown, Circle } from "lucide-react"

interface AccordionItemProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  index?: number
  onToggle?: (index: number, isOpen: boolean) => void
  isControlled?: boolean
  isOpenControlled?: boolean
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  defaultOpen = false,
  index = 0,
  onToggle,
  isControlled = false,
  isOpenControlled = false,
}) => {
  const [isOpenState, setIsOpenState] = useState<boolean>(defaultOpen)
  const isOpen = isControlled ? isOpenControlled : isOpenState

  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState<number>(0)
  const [hovering, setHovering] = useState<boolean>(false)

  const handleToggle = () => {
    if (!isControlled) {
      setIsOpenState(!isOpen)
    }
    if (onToggle && typeof index === "number") {
      onToggle(index, !isOpen)
    }
  }

  // Calculate content height whenever content changes or opens/closes
  useEffect(() => {
    if (contentRef.current) {
      // Use requestAnimationFrame for smoother transitions
      requestAnimationFrame(() => {
        setContentHeight(isOpen ? contentRef.current?.scrollHeight || 0 : 0)
      })
    }
  }, [isOpen, children])

  // Re-measure height on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isOpen && contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isOpen])

  return (
    <div
      className={`group relative transition-all duration-300 ease-in-out ${
        isOpen ? "bg-gradient-to-r from-emerald-900/20 to-transparent" : "hover:bg-emerald-900/10"
      }`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Left accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-cyan-400 opacity-0 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "group-hover:opacity-40"
        }`}
      />

      <button
        className="flex w-full items-center justify-between py-5 px-6 sm:px-8 text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-opacity-50"
        onClick={handleToggle}
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <div className="relative mr-4 w-6 h-6 flex-shrink-0">
            {/* Animated indicator */}
            <Circle
              className={`absolute h-3 w-3 text-emerald-400 transition-all duration-300 ${
                isOpen ? "opacity-100 scale-100" : "opacity-0 scale-0"
              }`}
              fill="currentColor"
            />
            <Circle
              className={`absolute h-3 w-3 text-emerald-400 transition-all duration-300 ${
                !isOpen && hovering ? "opacity-30 scale-100" : "opacity-0 scale-0"
              }`}
              fill="currentColor"
            />
          </div>
          <span
            className={`text-base sm:text-lg font-medium transition-all duration-300 ${
              isOpen
                ? "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400"
                : "text-gray-100 group-hover:text-emerald-300"
            }`}
          >
            {title}
          </span>
        </div>

        <div className="relative flex items-center justify-center h-6 w-6 flex-shrink-0">
          <ChevronDown
            className={`absolute h-5 w-5 transition-all duration-500 ${
              isOpen ? "rotate-180 text-cyan-400" : "text-emerald-400 group-hover:scale-110"
            }`}
          />
        </div>
      </button>

      {/* Content container with animated height */}
      <div
        ref={contentRef}
        style={{ height: `${contentHeight}px` }}
        className={`overflow-hidden transition-all duration-500 ease-out will-change-[height,opacity] ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!isOpen}
      >
        <div
          className={`p-4 sm:p-8 pt-0 pl-16 sm:pl-20 pr-6 sm:pr-12 text-gray-300 leading-relaxed transition-opacity duration-500 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          {children}
        </div>
      </div>

      {/* Border bottom with animation */}
      <div
        className={`h-px w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent transition-opacity duration-300 ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  )
}

interface AccordionProps {
  children: React.ReactNode
  className?: string
  type?: "single" | "multiple"
  defaultExpandedIndices?: number[]
}

export const Accordion: React.FC<AccordionProps> = ({
  children,
  className = "",
  type = "multiple",
  defaultExpandedIndices = [],
}) => {
  const [openIndices, setOpenIndices] = useState<number[]>(defaultExpandedIndices)

  const handleToggle = (index: number, isOpen: boolean) => {
    if (type === "single") {
      setOpenIndices(isOpen ? [index] : [])
    } else {
      setOpenIndices((prev) => (isOpen ? [...prev, index] : prev.filter((i) => i !== index)))
    }
  }

  // Enhanced children with controlled state
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement<AccordionItemProps>(child)) {
      return React.cloneElement(child, {
        index,
        isControlled: true,
        isOpenControlled: openIndices.includes(index),
        onToggle: handleToggle,
      })
    }
    return child
  })

  return (
    <div
      className={`w-full overflow-hidden rounded-xl bg-gray-900/30 backdrop-blur-sm border border-emerald-500/10 shadow-lg shadow-emerald-900/20 ${className}`}
    >
      {enhancedChildren}
    </div>
  )
}

