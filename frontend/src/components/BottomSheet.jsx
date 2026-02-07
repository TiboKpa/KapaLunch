import { useState, useEffect, useRef } from 'react'
import '../styles/BottomSheet.css'

const BottomSheet = ({ 
  children, 
  defaultPosition = 'mid', 
  positions = { high: 'calc(100dvh - 64px)', mid: '45vh', low: '5vh' },
  onPositionChange 
}) => {
  const [position, setPosition] = useState(defaultPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const sheetRef = useRef(null)
  
  // Expose current position to parent
  useEffect(() => {
    if (onPositionChange) {
      onPositionChange(position)
    }
  }, [position, onPositionChange])

  // Update external control
  useEffect(() => {
    if (defaultPosition && defaultPosition !== position) {
      setPosition(defaultPosition)
    }
  }, [defaultPosition])

  const handleTouchStart = (e) => {
    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    setCurrentY(e.touches[0].clientY)
    
    // Prevent scrolling background if dragging the sheet handle
    if (e.cancelable) e.preventDefault()
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    
    const diff = currentY - startY
    const windowHeight = window.innerHeight
    const threshold = windowHeight * 0.1 // 10% movement threshold
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Dragged down
        if (position === 'high') setPosition('mid')
        else if (position === 'mid') setPosition('low')
      } else {
        // Dragged up
        if (position === 'low') setPosition('mid')
        else if (position === 'mid') setPosition('high')
      }
    }
  }

  // Helper to handle both numeric (vh assumed) and string values
  const getHeight = () => {
    const val = positions[position] || positions.mid
    if (typeof val === 'number') return `${val}vh`
    return val
  }

  return (
    <div 
      ref={sheetRef}
      className={`bottom-sheet ${position}`}
      style={{ height: getHeight() }}
    >
      <div 
        className="sheet-handle-area"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="sheet-handle-bar" />
      </div>
      <div className="sheet-content">
        {children}
      </div>
    </div>
  )
}

export default BottomSheet