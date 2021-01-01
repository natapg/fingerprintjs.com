import React, { useState } from 'react'
import { ReactComponent as ChevronRightSvg } from '../../img/chevron-right.svg'
import { ReactComponent as CheckSvg } from '../../img/check.svg'
import { ReactComponent as CloseSvg } from '../../img/close.svg'
import classNames from 'classnames'
import Button from '../common/Button'
import { FormState } from '../../types/FormState'
import { FPJS_DASHBOARD_ENDPOINT } from '../../constants/env'
import { useVisitorData } from '../../context/FpjsContext'
import { sendEvent } from '../../helpers/gtm'
import { Forms, useForm } from '../../hooks/useForm'
import styles from './GetStartedForm.module.scss'

interface GetStartedFormProps {
  className?: string | string[]
  bullets?: string[]
  wide?: boolean
}

export default function GetStartedForm({
  className,
  bullets = ['10 Day Trial', 'Cancel Any Time', 'API & Webhooks'],
  wide,
}: GetStartedFormProps) {
  const { visitorData } = useVisitorData()
  const visitorId = visitorData?.visitorId
  const dashboardEndpoint = FPJS_DASHBOARD_ENDPOINT
  const [email, setEmail] = useState('')
  const { formState, errorMessage, updateFormState, updateErrorMessage } = useForm(Forms.Signup)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    updateFormState(FormState.Loading)

    const { ok, error } = await fetch(`${dashboardEndpoint}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fpjsVisitorId: visitorId }),
    }).then((response) => response.json())

    if (!ok) {
      updateErrorMessage(error.message || 'Something gone wrong. Please try again later.')
      updateFormState(FormState.Failed)
      setTimeout(() => {
        updateFormState(FormState.Default)
      }, 2500)
    } else {
      updateFormState(FormState.Success)
      sendEvent({ event: 'signupintent.success' })
    }
  }

  return (
    <form
      className={classNames(
        className,
        styles.form,
        styles.getStarted,
        { [styles.success]: formState === FormState.Success },
        { [styles.failed]: formState === FormState.Failed },
        { [styles.loading]: formState === FormState.Loading },
        { [styles.wide]: wide }
      )}
      onSubmit={handleSubmit}
    >
      {(formState === FormState.Default || formState === FormState.Loading) && (
        <div className={classNames(styles.field, styles.withButton)}>
          <label
            htmlFor='email'
            className={classNames(styles.label, { [styles.wideLabel]: wide })}
            aria-label='Enter your email'
          >
            <input
              type='email'
              name='email'
              required
              className={classNames(styles.field, { [styles.wideField]: wide }, 'gtm-email-input')}
              placeholder='E-Mail'
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
          </label>
          <Button
            className={classNames(styles.submit, { [styles.wideSubmit]: wide }, 'gtm-get-started-btn')}
            type='submit'
            mobileIcon={<ChevronRightSvg className='gtm-get-started-btn' />}
          >
            {wide ? 'Start 10 Day Free Trial' : 'Get Started'}
          </Button>
        </div>
      )}
      {formState === FormState.Success && (
        <div className={classNames(styles.state, styles.success)}>
          <CheckSvg className={styles.icon} />
          <div className={styles.label}>We sent you a link to start your trial</div>
        </div>
      )}
      {formState === FormState.Failed && (
        <div className={classNames(styles.state, styles.failed)}>
          <CloseSvg className={styles.icon} />
          <div className={styles.label}>{errorMessage}</div>
        </div>
      )}
      <ul className={styles.description}>
        {bullets.map((bullet) => (
          <li key={bullet}>
            <CheckSvg />
            {bullet}
          </li>
        ))}
      </ul>
    </form>
  )
}
