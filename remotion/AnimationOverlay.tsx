import React from 'react'
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion'
import type { AnimationEvent, TemplateName, TemplateProps } from '../lib/animationTypes'
import { LabelOverlay } from './templates'

interface Props {
  events:  AnimationEvent[]
  width:   number
  height:  number
}

function TemplateSwitch({ template, props }: { template: TemplateName; props: TemplateProps }) {
  switch (template) {
    case 'LabelOverlay': return <LabelOverlay {...props} />
    default:             return <LabelOverlay {...props} />
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
