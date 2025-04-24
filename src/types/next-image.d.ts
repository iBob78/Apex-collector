declare module 'next/image' {
  interface ImageProps {
    src: string
    alt: string
    fill?: boolean
    sizes?: string
    className?: string
    onLoad?: () => void
    priority?: boolean
    quality?: number
  }

  const Image: React.FC<ImageProps>
  export default Image
}
