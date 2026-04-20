// Type declarations for CSS side-effect imports
declare module '*.css' {
  const styles: { [className: string]: string }
  export default styles
}
