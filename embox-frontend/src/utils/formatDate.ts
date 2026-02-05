export const formatDateShort = (dateString: string) => {
  const date = new Date(dateString)

  const formatted = date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "2-digit"
  })

  return formatted.replace(/\s/g, "-")
}
