/**
 * @packageDocumentation
 * @module Heatmap
 *
 * Framework-agnostic, GitHub-style calendar heat-map that visualizes
 * daily habit-completion counts across a full calendar year (Jan 1 - Dec 31).
 *
 * ```ts
 * import * as heatmap from "./heatmap.js";
 * heatmap.renderHeatmap(container, habits, 2025);
 * ```
 */

import type { Habit } from "./types.js"
import * as model from "./components/habits/habits.model.js"

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export type HeatLevel = 0 | 1 | 2 | 3 | 4

export function countCompletionsByDay(habits: Habit[]): Record<string, number> {
  const daily: Record<string, number> = {}
  habits.forEach((h) => {
    if (h.frequency === "daily") {
      h.completedDates.forEach((ts) => {
        const day = localDateKey(new Date(ts))
        daily[day] = (daily[day] ?? 0) + 1
      })
    } else {
      const uniqueDays = new Set<string>()
      h.completedDates.forEach(ts => {
        uniqueDays.add(localDateKey(new Date(ts)))
      })
      uniqueDays.forEach(day => {
        daily[day] = (daily[day] ?? 0) + 1
      })
    }
  })
  return daily
}

export function getHabitsCompletedOnDay(habits: Habit[], dateKey: string): Record<string, boolean> {
  const completed: Record<string, boolean> = {}
  const date = dateFromKey(dateKey)

  habits.forEach((habit) => {
    const isCompleted = habit.completedDates.some((d) => {
      const dateStr = localDateKey(new Date(d))
      return dateStr === dateKey
    })

    if (isCompleted) {
      completed[habit.id] = true
    }
  })

  return completed
}

export function localDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${day}-${m}-${y}`
}

function levelFromCount(count: number): HeatLevel {
  if (count >= 4) return 4
  if (count >= 3) return 3
  if (count >= 2) return 2
  if (count >= 1) return 1
  return 0
}

function formatDateForTooltip(dateStr: string): string {
  const parts = dateStr.split("-")
  return `${parts[0]} ${MONTHS[Number.parseInt(parts[1]) - 1]} ${parts[2]}`
}

function createHabitTooltip(habits: Habit[], dateKey: string): HTMLElement {
  const tooltip = document.createElement("div")
  tooltip.className = "heatmap-tooltip"

  const date = formatDateForTooltip(dateKey)
  tooltip.innerHTML = `<div class="tooltip-date">${date}</div>`

  const completedHabits = habits.filter((habit) =>
    habit.completedDates.some((d) => localDateKey(new Date(d)) === dateKey),
  )

  if (completedHabits.length === 0) {
    tooltip.innerHTML += `<div class="tooltip-empty">No habits completed</div>`
  } else {
    tooltip.innerHTML += `<div class="tooltip-title">Completed habits:</div><ul class="tooltip-list">`
    completedHabits.forEach((habit) => {
      tooltip.innerHTML += `<div> > ${habit.name} \n</div>`
    })
    tooltip.innerHTML += `</ul>`
  }

  return tooltip
}

function createDaySelectionModal(
  container: HTMLElement,
  habits: Habit[],
  dateKey: string,
  onClose: () => void
): void {
  const modal = document.createElement("div")
  modal.className = "heatmap-modal-overlay"

  const dateObj = dateFromKey(dateKey)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const isFutureDate = dateObj > today
  const formattedDate = formatDateForTooltip(dateKey)
  const completedHabits = getHabitsCompletedOnDay(habits, dateKey)

  modal.innerHTML = `
    <div class="heatmap-modal">
      <div class="modal-header">
        <div class="modal-title">Habits for ${formattedDate}</div>
        <button class="modal-close-btn">&times;</button>
      </div>
      <div class="modal-content">
        <div class="habits-list">
          ${
            habits.length === 0
              ? '<div class="no-habits">No habits found. Add some habits first.</div>'
              : habits.map((habit) => `
                <div class="habit-item" data-id="${habit.id}">
                  <label class="habit-checkbox-label">
                    <input 
                      type="checkbox" 
                      class="habit-checkbox" 
                      ${completedHabits[habit.id] ? "checked" : ""}
                      ${isFutureDate ? "disabled" : ""}
                    >
                    <span class="habit-name">${habit.name}</span>
                    ${isFutureDate ? '<span class="future-date-warning">(Future date)</span>' : ''}
                  </label>
                </div>
              `).join("")
          }
        </div>
      </div>
      <div class="modal-footer">
        <button class="modal-save-btn action-btn" ${isFutureDate ? "disabled" : ""}>Save</button>
        <button class="modal-cancel-btn action-btn">Cancel</button>
      </div>
    </div>
  `

  container.appendChild(modal)

  const closeModal = () => {
    container.removeChild(modal)
    onClose()
  }

  modal.querySelector(".modal-close-btn")?.addEventListener("click", closeModal)
  modal.querySelector(".modal-cancel-btn")?.addEventListener("click", closeModal)
  
  const saveBtn = modal.querySelector(".modal-save-btn")
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const checkboxes = modal.querySelectorAll(".habit-checkbox") as NodeListOf<HTMLInputElement>

      checkboxes.forEach((checkbox) => {
        const habitId = checkbox.closest(".habit-item")?.getAttribute("data-id")
        if (habitId) {
          if (checkbox.checked) {
            model.markComplete(habitId, dateObj.toISOString())
          } else {
            model.removeCompletion(habitId, dateKey)
          }
        }
      })

      closeModal()
    })
  }
}

function dateFromKey(dateKey: string): Date {
  const [day, month, year] = dateKey.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  date.setHours(0, 0, 0, 0)
  return date
}

export function renderHeatmap(
  container: HTMLElement,
  habits: Habit[],
  year: number = new Date().getFullYear()
): void {
  const counts = countCompletionsByDay(habits)
  const firstDay = new Date(year, 0, 1)
  const lastDay = new Date(year, 11, 31)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startDate = new Date(firstDay)
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7 //monday-based week
  startDate.setDate(startDate.getDate() - firstDayOfWeek)

  const endDate = new Date(lastDay)
  const lastDayOfWeek = (lastDay.getDay() + 6) % 7
  endDate.setDate(endDate.getDate() + (6 - lastDayOfWeek))

  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1
  const totalWeeks = Math.ceil(totalDays / 7)

  let currentMonth = -1
  let monthStartWeek = 0
  let monthLabels = ""
  let currentDate = new Date(startDate)

  for (let week = 0; week < totalWeeks; week++) {
    const weekDate = new Date(currentDate)
    weekDate.setDate(currentDate.getDate() + week * 7)
    const month = weekDate.getMonth()

    if (month !== currentMonth) {
      if (currentMonth !== -1) {
        const monthWidth = (week - monthStartWeek) * 20 - 4
        monthLabels += `<div class="month-label" style="width: ${monthWidth}px;">${MONTHS[currentMonth]}</div>`
      }
      currentMonth = month
      monthStartWeek = week
    }
  }

  if (currentMonth !== -1) {
    const monthWidth = (totalWeeks - monthStartWeek) * 20 - 4
    monthLabels += `<div class="month-label" style="width: ${monthWidth}px;">${MONTHS[currentMonth]}</div>`
  }

  let html = `
    <div class="heatmap-wrapper">
      <div class="heatmap-controls">
        <div class="heatmap-year-selector">
          <button class="year-nav-btn" id="prevYearBtn"><</button>
          <span class="current-year">${year}</span>
          <button class="year-nav-btn" id="nextYearBtn">></button>
        </div>
        <div class="heatmap-legend">
          <div class="legend-label">Less</div>
          <div class="heatmap-cell level-0"></div>
          <div class="heatmap-cell level-1"></div>
          <div class="heatmap-cell level-2"></div>
          <div class="heatmap-cell level-3"></div>
          <div class="heatmap-cell level-4"></div>
          <div class="legend-label">More</div>
        </div>
      </div>
      <div class="heatmap-content">
        <div class="heatmap-months-container">
          <div class="month-labels-row">${monthLabels}</div>
        </div>
        <div class="heatmap">
          <div class="heatmap-weekdays">
            ${WEEKDAYS.map((d) => `<div class="weekday-label">${d}</div>`).join("")}
          </div>
          <div class="heatmap-grid">
  `

  currentDate = new Date(startDate)
  for (let week = 0; week < totalWeeks; week++) {
    html += `<div class="heatmap-column">`
    for (let day = 0; day < 7; day++) {
      const dateKey = localDateKey(currentDate)
      const count = counts[dateKey] ?? 0
      const level = levelFromCount(count)
      const isWithinYear = currentDate >= firstDay && currentDate <= lastDay
      const isFuture = currentDate > today
      
      const cellClass = [
        "heatmap-cell",
        `level-${level}`,
        !isWithinYear ? "outside-year" : "",
        isFuture ? "future-day" : ""
      ].filter(Boolean).join(" ")

      const formattedDate = formatDateForTooltip(dateKey)
      const title = `${formattedDate}: ${count} completion${count !== 1 ? "s" : ""}`

      html += `
        <div class="${cellClass}" 
             title="${title}" 
             data-date="${dateKey}" 
             data-count="${count}"
             data-in-year="${isWithinYear}"
             ${isFuture ? 'data-future="true"' : ''}>
        </div>
      `

      currentDate.setDate(currentDate.getDate() + 1)
    }
    html += `</div>`
  }

  html += `
          </div>
        </div>
      </div>
      <div id="heatmap-tooltip-container"></div>
    </div>
  `

  container.innerHTML = html

  container.querySelector("#prevYearBtn")?.addEventListener("click", () => {
    renderHeatmap(container, habits, year - 1)
  })

  container.querySelector("#nextYearBtn")?.addEventListener("click", () => {
    renderHeatmap(container, habits, year + 1)
  })

  const tooltipContainer = container.querySelector("#heatmap-tooltip-container") as HTMLElement

  container.querySelectorAll('.heatmap-cell[data-in-year="true"]').forEach((cell) => {
    const cellElement = cell as HTMLElement
    const isFuture = cellElement.hasAttribute("data-future")

    cellElement.addEventListener("mouseover", (e) => {
      if (isFuture) return
      
      const dateKey = cellElement.getAttribute("data-date") || ""
      const tooltip = createHabitTooltip(habits, dateKey)
      tooltipContainer.innerHTML = ""
      tooltipContainer.appendChild(tooltip)

      const rect = cellElement.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      let left = rect.left - containerRect.left + rect.width + 10
      let top = rect.top - containerRect.top

      const tooltipWidth = 250
      if (left + tooltipWidth > containerRect.width) {
        left = rect.left - containerRect.left - tooltipWidth - 10
      }

      const tooltipHeight = Math.min(300, tooltip.scrollHeight)
      if (top + tooltipHeight > containerRect.height) {
        top = containerRect.height - tooltipHeight - 10
      }

      tooltip.style.left = `${left}px`
      tooltip.style.top = `${top}px`
      tooltip.style.display = "block"
    })

    cellElement.addEventListener("mouseout", () => {
      tooltipContainer.innerHTML = ""
    })

    cellElement.addEventListener("click", (e) => {
      if (isFuture) return
      
      const dateKey = cellElement.getAttribute("data-date") || ""
      createDaySelectionModal(container, habits, dateKey, () => {
        renderHeatmap(container, model.getAllHabits(), year)
      })
    })
  })
}