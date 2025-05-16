/**
 * @packageDocumentation
 * @module Heatmap
 *
 * GitHub-like calendar heat-map that visualizes
 * daily habit-completion counts across a full calendar year (Jan 1 - Dec 31).
 *
 * \`\`\`ts
 * import * as heatmap from "./heatmap.js";
 * heatmap.renderHeatmap(container, habits, 2025);
 * \`\`\`
 */

import type { Habit } from "./types.js"

/** Calendar weekday captions (Mon at top, Sun at bottom). */
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

/** Month captions used for the top row (Jan-Dec). */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** Level of color-intensity for a single calendar cell (0 = none). */
export type HeatLevel = 0 | 1 | 2 | 3 | 4

/* Returns a `{ dd-mm-yyyy: count }` map for all completions recorded in the supplied habits array. */
export function countCompletionsByDay(habits: Habit[]): Record<string, number> {
  const daily: Record<string, number> = {}
  habits.forEach((h) =>
    h.completedDates.forEach((ts) => {
      const day = localDateKey(new Date(ts))
      daily[day] = (daily[day] ?? 0) + 1
    }),
  )
  return daily
}

/** Returns `DD-MM-YYYY`. */
function localDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${day}-${m}-${y}`
}

/** Converts a raw count into a heat-level (0-4). */
function levelFromCount(count: number): HeatLevel {
  if (count >= 4) return 4
  if (count >= 3) return 3
  if (count >= 2) return 2
  if (count >= 1) return 1
  return 0
}

/**
 * Formats a date as a readable string for tooltips
 */
function formatDateForTooltip(dateStr: string): string {
  const parts = dateStr.split("-")
  return `${parts[0]} ${MONTHS[Number.parseInt(parts[1]) - 1]} ${parts[2]}`
}

/**
 * Renders (or re-renders) the heat-map inside `container`.
 *
 * @param container – Element that should hold the grid.
 * @param habits    – Current habits array (used to derive counts).
 * @param year      – The year to display (defaults to current year).
 */
export function renderHeatmap(container: HTMLElement, habits: Habit[], year: number = new Date().getFullYear()): void {
  const counts = countCompletionsByDay(habits)

  const firstDay = new Date(year, 0, 1)
  const lastDay = new Date(year, 11, 31)

  const startDate = new Date(firstDay)
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7 // sunday=0 to monday=0
  startDate.setDate(startDate.getDate() - firstDayOfWeek)

  const endDate = new Date(lastDay)
  const lastDayOfWeek = (lastDay.getDay() + 6) % 7
  endDate.setDate(endDate.getDate() + (6 - lastDayOfWeek))


  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1
  const totalWeeks = Math.ceil(totalDays / 7)

  let html = `<div class="heatmap-wrapper">
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
                <div class="heatmap-content">`

  let currentDate = new Date(startDate)
  let currentMonth = -1
  let monthStartWeek = 0
  let monthLabels = ""

  for (let week = 0; week < totalWeeks; week++) {
    const weekDate = new Date(currentDate)
    weekDate.setDate(currentDate.getDate() + week * 7)
    const month = weekDate.getMonth()

    if (month !== currentMonth) {
      if (currentMonth !== -1) {
        const monthWidth = (week - monthStartWeek) * 20 - 4 // 20px per week, 4px for gap
        monthLabels += `<div class="month-label" style="width: ${monthWidth}px;">${MONTHS[currentMonth]}</div>`
      }

      currentMonth = month
      monthStartWeek = week
    }
  }

  // Add the last month
  if (currentMonth !== -1) {
    const monthWidth = (totalWeeks - monthStartWeek) * 20 - 4
    monthLabels += `<div class="month-label" style="width: ${monthWidth}px;">${MONTHS[currentMonth]}</div>`
  }

  html += `<div class="heatmap-months-container">
             <div class="month-labels-row">${monthLabels}</div>
           </div>
           <div class="heatmap">
             <div class="heatmap-weekdays">
               ${WEEKDAYS.map((d) => `<div class="weekday-label">${d}</div>`).join("")}
             </div>
             <div class="heatmap-grid">`

  // Reset to start date for generating cells
  currentDate = new Date(startDate)

  // Generate week columns
  for (let week = 0; week < totalWeeks; week++) {
    html += `<div class="heatmap-column">`

    // Generate day cells for each weekday
    for (let day = 0; day < 7; day++) {
      const dateKey = localDateKey(currentDate)
      const count = counts[dateKey] ?? 0
      const level = levelFromCount(count)

      // Check if date is within the actual year
      const isWithinYear = currentDate >= firstDay && currentDate <= lastDay
      const cellClass = isWithinYear ? `heatmap-cell level-${level}` : `heatmap-cell level-0 outside-year`

      const formattedDate = formatDateForTooltip(dateKey)
      const title = `${formattedDate}: ${count} completion${count !== 1 ? "s" : ""}`

      html += `<div class="${cellClass}" 
                    title="${title}" 
                    data-date="${dateKey}" 
                    data-count="${count}"
                    data-in-year="${isWithinYear}"></div>`

      currentDate.setDate(currentDate.getDate() + 1)
    }

    html += `</div>`
  }

  html += `</div></div></div></div>`


  container.innerHTML = html

  const prevYearBtn = container.querySelector("#prevYearBtn")
  const nextYearBtn = container.querySelector("#nextYearBtn")

  if (prevYearBtn) {
    prevYearBtn.addEventListener("click", () => {
      renderHeatmap(container, habits, year - 1)
    })
  }

  if (nextYearBtn) {
    nextYearBtn.addEventListener("click", () => {
      renderHeatmap(container, habits, year + 1)
    })
  }
}
