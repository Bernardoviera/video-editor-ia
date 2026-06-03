import React from 'react'
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion'
import type { AnimationEvent, TemplateName, TemplateProps } from '../lib/animationTypes'
import {
  LabelOverlay, StatCard, MoneyCard,
  DarkReveal, ImpactTitle, GlitchReveal, WordPop, SlideIn,
  BlurTitle, TrackingReveal, ShimmerText, LiquidFill, FloatCard,
  ChromaticTransition, FrostedTransition, TextStack, ShaderReveal,
} from './templates'

interface Props {
  events:  AnimationEvent[]
  width:   number
  height:  number
}

function TemplateSwitch({ template, props }: { template: TemplateName; props: TemplateProps }) {
  switch (template) {
    case 'LabelOverlay':        return <LabelOverlay        {...props} />
    case 'StatCard':            return <StatCard            {...props} />
    case 'MoneyCard':           return <MoneyCard           {...props} />
    case 'DarkReveal':          return <DarkReveal          {...props} />
    case 'ImpactTitle':         return <ImpactTitle          {...props} />
    case 'GlitchReveal':        return <GlitchReveal         {...props} />
    case 'WordPop':             return <WordPop              {...props} />
    case 'SlideIn':             return <SlideIn              {...props} />
    case 'BlurTitle':           return <BlurTitle            {...props} />
    case 'TrackingReveal':      return <TrackingReveal       {...props} />
    case 'ShimmerText':         return <ShimmerText          {...props} />
    case 'LiquidFill':          return <LiquidFill           {...props} />
    case 'FloatCard':           return <FloatCard            {...props} />
    case 'ChromaticTransition': return <ChromaticTransition  {...props} />
    case 'FrostedTransition':   return <FrostedTransition    {...props} />
    case 'TextStack':           return <TextStack            {...props} />
    case 'ShaderReveal':        return <ShaderReveal         {...props} />
    default:                    return null
  }
}

export const AnimationOverlay: React.FC<Props> = ({ events }) => {
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill style={{ background: 'transparent' }}>
      {events.map((event) => {
        const startFrame     = Math.round(event.startTime * fps)
        const durationFrames = Math.max(1, Math.round(event.duration * fps))

        return (
          <Sequence
            key={event.id}
            from={startFrame}
            durationInFrames={durationFrames}
          >
            <TemplateSwitch template={event.template} props={event.props} />
          </Sequence>
        )
      })}
    </AbsoluteFill>
  )
}
