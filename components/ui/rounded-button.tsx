import React, { ReactNode } from 'react'
import { Button } from './button'

type Props = {
    children: ReactNode
}

const RoundedButton  = (props: Props) => {
  return (
    <Button className="rounded-full border border-white/10 dark:border-gray-500/20">
        {props.children}
    </Button>
  )
}

export default RoundedButton