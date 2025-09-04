import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ValidatedTextField from '@components/Form/ValidatedTextField'
import ValidatedTextArea from '@components/Form/ValidatedTextArea'
import ValidatedLabel from '@components/Form/ValidatedLabel'
import SubmitBtn from '@components/Form/SubmitBtn'
import ToastNotification from '@components/Notification/ToastNotification'
import ImageUploadField from '@components/Form/ImageUploadField'
import FormRow from '@components/Form/FormRow'
// import { AddLender, UpdateLender, getLenderById } from '@api/cms-services'

export default function LenderCreate() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [openAdvanced, setOpenAdvanced] = useState(false)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      logo: '',
      website: '',
      playStoreLink: '',
      appStoreLink: '',
      startingInterestRate: '',
      maximumLoanAmount: '',
      minimumLoanAmount: '',
      maximumTenure: '',
      minimumTenure: '',
      processingFee: '',
      prepaymentCharges: '',
      latePaymentCharges: '',
      foreclosureCharges: '',
      eligibilityCriteria: '',
      customerSupportNumber: '',
      customerSupportEmail: '',
      termsAndConditionsLink: ''
    }
  })

  const onSubmit = async (data) => {
    console.log("Form Data:", data)
  }


   useEffect(() => {
    if (
      errors.startingInterestRate ||
      errors.processingFee ||
      errors.maximumLoanAmount ||
      errors.minimumLoanAmount ||
      errors.maximumTenure ||
      errors.minimumTenure ||
      errors.prepaymentCharges ||
      errors.latePaymentCharges ||
      errors.foreclosureCharges ||
      errors.eligibilityCriteria ||
      errors.customerSupportNumber ||
      errors.customerSupportEmail ||
      errors.termsAndConditionsLink
    ) {
      setOpenAdvanced(true)
    }
  }, [errors])
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Lender' : 'Create Lender'}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Basic Info */}
        <div className="bg-white shadow p-6 rounded-xl space-y-4">
          <FormRow cols={3}>
            <ValidatedTextField
              name="name"
              control={control}
              label="Lender Name"
              errors={errors}
              rules={{ required: true }}
              helperText='Lender name required!'
                required={true}
            />

            <ValidatedTextField
              name="slug"
              control={control}
              label="Slug"
              errors={errors}
              rules={{ required: true }}
              helperText='Slug required!'
               required={true}
            />

            <ValidatedTextField
              name="website"
              control={control}
              label="Website"
              errors={errors}
              rules={{ required: true }}
              helperText='Website required!'
               required={true}
            />
          </FormRow>

          <FormRow cols={3}>
            <ValidatedTextField
              name="appStoreLink"
              control={control}
              label="App Store Link"
              errors={errors}
              rules={{ required: true }}
              helperText='App Store Link required!'
               required={true}
            />

            <ValidatedTextField
              name="playStoreLink"
              control={control}
              label="Play Store Link"
              errors={errors}
              rules={{ required: true }}
              helperText='Play Store Link required!'
               required={true}
            />

          </FormRow>

          <FormRow cols={3}>


          </FormRow>
          <FormRow cols={3}>
            <div>
              <ValidatedLabel 
              label="Select Logo" 
              required={true}
              />
              <ImageUploadField
                name="logo"
                control={control}
                label="Logo"
                errors={errors}
                rules={{ required: "Logo required!" }}
                helperText='Logo required!'
                 
              />
            </div>

            <ValidatedTextArea
              name="description"
              control={control}
              label="Description"
              errors={errors}
              rows={3}
              rules={{ required: "Description required!" }}
              helperText=''
               required={true}
            />
          </FormRow>
        </div>


        <div className="w-full join join-vertical bg-base-100">
          <div className="collapse collapse-arrow join-item border-base-300 border">
            <input 
            type="checkbox" 
            checked={openAdvanced}
              onChange={() => setOpenAdvanced(!openAdvanced)}
            />
            <div className="collapse-title font-semibold">Advanced Fields</div>
            <div className="collapse-content text-sm">
              {/* Financial Details */}
              <div className="space-y-4">
                <FormRow cols={3}>
                  <ValidatedTextField
                    name="startingInterestRate"
                    control={control}
                    label="Starting Interest Rate"
                    errors={errors}
                    rules={{ required: true }}
                    helperText='Starting Interest Rate required!'
                  />
                  <ValidatedTextField name="processingFee" control={control} label="Processing Fee" errors={errors} />
                  <ValidatedTextField name="maximumLoanAmount" control={control} label="Maximum Loan Amount" errors={errors} />
                  <ValidatedTextField name="minimumLoanAmount" control={control} label="Minimum Loan Amount" errors={errors} />
                  <ValidatedTextField name="maximumTenure" control={control} label="Maximum Tenure" errors={errors} />
                  <ValidatedTextField name="minimumTenure" control={control} label="Minimum Tenure" errors={errors} />
                  <ValidatedTextField name="prepaymentCharges" control={control} label="Prepayment Charges" errors={errors} />
                  <ValidatedTextField name="latePaymentCharges" control={control} label="Late Payment Charges" errors={errors} />
                  <ValidatedTextField name="foreclosureCharges" control={control} label="Foreclosure Charges" errors={errors} />

                  <ValidatedTextArea name="eligibilityCriteria" control={control} label="Eligibility Criteria" errors={errors} rows={3} />
                </FormRow>
              </div>
              {/* Support Details */}
              <div className="mt-8 space-y-4">
                <FormRow cols={3}>
                  <ValidatedTextField name="customerSupportNumber" control={control} label="Customer Support Number" errors={errors} />
                  <ValidatedTextField name="customerSupportEmail" control={control} label="Customer Support Email" errors={errors} />
                  <ValidatedTextField name="termsAndConditionsLink" control={control} label="Terms & Conditions Link" errors={errors} />
                </FormRow>


              </div>

            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <SubmitBtn loading={loading} label={isEdit ? 'Update' : 'Submit'} />
        </div>
      </form>
    </div>
  )
}
