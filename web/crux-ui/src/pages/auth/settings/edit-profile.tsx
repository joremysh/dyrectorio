import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { SaveDiscardPageMenu } from '@app/components/shared/page-menu'
import { ATTRIB_CSRF } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { EditProfile } from '@app/models'
import { API_SETTINGS_EDIT_PROFILE, ROUTE_LOGIN, ROUTE_SETTINGS, ROUTE_SETTINGS_EDIT_PROFILE } from '@app/routes'
import { findAttributes, findMessage, sendForm, withContextAuthorization } from '@app/utils'
import { SelfServiceSettingsFlow } from '@ory/kratos-client'
import kratos from '@server/kratos'
import { useFormik } from 'formik'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useRef, useState } from 'react'

const SettingsPage = (props: SelfServiceSettingsFlow) => {
  const { ui: propsUi, id, identity } = props

  const { t } = useTranslation('settings')
  const router = useRouter()

  const [ui, setUi] = useState(propsUi)
  const saveRef = useRef<() => Promise<any>>()

  const formik = useFormik({
    initialValues: {
      email: findAttributes(ui, 'traits.email').value,
      firstName: findAttributes(ui, 'traits.name.first').value,
      lastName: findAttributes(ui, 'traits.name.last').value,
    },
    onSubmit: async values => {
      const data: EditProfile = {
        flow: id,
        csrfToken: findAttributes(ui, ATTRIB_CSRF).value,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
      }
      const res = await sendForm('POST', API_SETTINGS_EDIT_PROFILE, data)

      if (res.ok) {
        router.back()
      } else if (res.status === 403) {
        router.replace(`${ROUTE_LOGIN}?refresh=${identity.traits.email}`)
      } else {
        const result = await res.json()
        setUi(result.ui)
      }
    },
  })

  saveRef.current = formik.submitForm

  const pageLink: BreadcrumbLink = {
    name: t('common:profile'),
    url: ROUTE_SETTINGS,
  }

  const sublinks: BreadcrumbLink[] = [
    {
      name: t('editProfile'),
      url: ROUTE_SETTINGS_EDIT_PROFILE,
    },
  ]

  return (
    <Layout title={t('editProfile')}>
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        <SaveDiscardPageMenu saveRef={saveRef} onDiscard={router.back} />
      </PageHeading>

      <DyoCard>
        <form className="flex flex-col text-bright w-1/2" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <DyoHeading element="h2" className="text-2xl">
            {t('editProfile')}
          </DyoHeading>
          <DyoLabel textColor="text-bright-muted">{t('tips')}</DyoLabel>
          <DyoInput
            label={t('firstName')}
            name="firstName"
            type="text"
            onChange={formik.handleChange}
            value={formik.values.firstName}
            message={findMessage(ui, 'traits.name.first')}
            grow
          />
          <DyoInput
            label={t('lastName')}
            name="lastName"
            type="text"
            onChange={formik.handleChange}
            value={formik.values.lastName}
            message={findMessage(ui, 'traits.name.last')}
            grow
          />
          <DyoInput
            label={t('common:email')}
            name="email"
            type="email"
            onChange={formik.handleChange}
            value={formik.values.email}
            message={findMessage(ui, 'traits.email')}
            grow
          />
          <DyoButton className="hidden" type="submit" />
        </form>
      </DyoCard>
    </Layout>
  )
}

export default SettingsPage

export const getPageServerSideProps = async (context: NextPageContext) => {
  const { cookie } = context.req.headers

  const flow = await kratos.initializeSelfServiceSettingsFlowForBrowsers(undefined, {
    headers: {
      Cookie: cookie,
    },
  })

  return {
    props: flow.data,
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
