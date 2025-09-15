// import { useForm } from 'react-hook-form';
// import { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import ValidatedTextField from '@components/Form/ValidatedTextField';
// import ValidatedTextArea from '@components/Form/ValidatedTextArea';
// import ValidatedLabel from '@components/Form/ValidatedLabel';
// import SubmitBtn from '@components/Form/SubmitBtn';
// import ImageUploadField from '@components/Form/ImageUploadField';
// import FormRow from '@components/Form/FormRow';
// import { uploadImage } from '../../../api-services/cms-services';
// import ToastNotification from '../../../components/Notification/ToastNotification';
// import { Toaster } from 'react-hot-toast';
// import { AddLender } from '../../../api-services/Modules/LenderApi';

// export default function LenderCreate() {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const isEdit = Boolean(id);

//   const [loading, setLoading] = useState(false);
//   const [openAdvanced, setOpenAdvanced] = useState(false);
//   const [fileInput, setFileInput] = useState('');
//   const [isUploadingBanner, setIsUploadingBanner] = useState(false);
//   const [bannerImageKey, setBannerImageKey] = useState('');
//   const [imgSrc, setImgSrc] = useState('');

//   const {
//     control,
//     handleSubmit,
//     setValue,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       name: '',
//       slug: '',
//       description: '',
//       logo: '',
//       website: '',
//       playStoreLink: '',
//       appStoreLink: '',
//       startingInterestRate: '',
//       maximumLoanAmount: '',
//       minimumLoanAmount: '',
//       maximumTenure: '',
//       minimumTenure: '',
//       processingFee: '',
//       prepaymentCharges: '',
//       latePaymentCharges: '',
//       foreclosureCharges: '',
//       eligibilityCriteria: '',
//       customerSupportNumber: '',
//       customerSupportEmail: '',
//       termsAndConditionsLink: '',
//       privacyPolicyLink: '',
//       faqLink: '',
//       aboutUsLink: '',
//       sortedOrder: '',
//     },
//   });

//   useEffect(() => {
//     if (
//       errors.startingInterestRate ||
//       errors.processingFee ||
//       errors.maximumLoanAmount ||
//       errors.minimumLoanAmount ||
//       errors.maximumTenure ||
//       errors.minimumTenure ||
//       errors.prepaymentCharges ||
//       errors.latePaymentCharges ||
//       errors.foreclosureCharges ||
//       errors.eligibilityCriteria ||
//       errors.customerSupportNumber ||
//       errors.customerSupportEmail ||
//       errors.termsAndConditionsLink ||
//       errors.privacyPolicyLink ||
//       errors.faqLink ||
//       errors.aboutUsLink ||
//       errors.sortedOrder
//     ) {
//       setOpenAdvanced(true);
//     }
//   }, [errors]);

//   const handleFileInputChangeBanner = async (e) => {
//     console.log('Image upload triggered');
//     try {
//       const file = e.target.files[0];
//       if (!file) {
//         ToastNotification.error('No file selected.');
//         return;
//       }
//       const img = new Image();
//       img.src = URL.createObjectURL(file);
//       img.onload = async () => {
//         setImgSrc(img.src);
//         const formData = new FormData();
//         formData.append('image_type', 'onBoardLender');
//         formData.append('image', file);
//         try {
//           setLoading(true);
//           setIsUploadingBanner(true);
//           const response = await uploadImage(formData);
//           console.log('Image Upload Response:', response.data.data.path);
//           const imagePath = response?.data?.data?.path;
//           setBannerImageKey(imagePath);
//           setValue('logo', imagePath); // Update form state
//           ToastNotification.success('Image uploaded successfully');
//         } catch (uploadError) {
//           console.error('Upload Error:', uploadError);
//           ToastNotification.error('Error uploading image.');
//         } finally {
//           setLoading(false);
//           setIsUploadingBanner(false);
//         }
//         URL.revokeObjectURL(img.src);
//       };
//       img.onerror = () => {
//         ToastNotification.error('Error loading image.');
//       };
//     } catch (err) {
//       console.error('Image Error:', err);
//       ToastNotification.error('An unexpected error occurred.');
//     }
//   };

//   const handleFileInputReset = () => {
//     setFileInput('');
//     setImgSrc('');
//     setBannerImageKey('');
//     setValue('logo', ''); // Reset logo in form state
//   };

//   const onSubmit = async (data) => {
//     console.log('Form Data:', { ...data, logo: bannerImageKey });
//     console.log('Form Errors:', errors);
//     if (Object.keys(errors).length > 0) {
//       ToastNotification.error('Please fill all required fields.');
//       return;
//     }
//     if (!bannerImageKey) {
//       ToastNotification.error('Please upload a logo image.');
//       return;
//     }
//     setLoading(true);
//     try {
//       const response = await AddLender({ ...data, logo: bannerImageKey });
//       console.log('API Response:', response);
//       if (response?.data?.success) {
//         ToastNotification.success('Lender Added Successfully');
//         navigate('/list-of-lenders');
//       } else {
//         ToastNotification.error(`Failed to add lender: ${response?.data?.message || 'Unknown error'}`);
//       }
//     } catch (error) {
//       console.error('AddLender Error:', error.response?.data || error.message);
//       ToastNotification.error(`Error: ${error.response?.data?.message || error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <Toaster />
//       <h2 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Lender' : 'Create Lender'}</h2>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         {/* Basic Info */}
//         <div className="bg-white shadow p-6 rounded-xl space-y-4">
//           <FormRow cols={3}>
//             <ValidatedTextField
//               name="name"
//               control={control}
//               label="Lender Name"
//               errors={errors}
//               rules={{ required: 'Lender name is required' }}
//               helperText={errors.name ? errors.name.message : 'Enter the lender’s name'}
//               required
//             />
//             <ValidatedTextField
//               name="slug"
//               control={control}
//               label="Slug"
//               errors={errors}
//               rules={{ required: 'Slug is required' }}
//               helperText={errors.slug ? errors.slug.message : 'Enter a unique slug'}
//               required
//             />
//             <ValidatedTextField
//               name="website"
//               control={control}
//               label="Website"
//               errors={errors}
//               rules={{ required: 'Website is required' }}
//               helperText={errors.website ? errors.website.message : 'Enter the lender’s website URL'}
//               required
//             />
//           </FormRow>

//           <FormRow cols={3}>
//             <ValidatedTextField
//               name="appStoreLink"
//               control={control}
//               label="App Store Link"
//               errors={errors}
//               rules={{ required: 'App Store Link is required' }}
//               helperText={errors.appStoreLink ? errors.appStoreLink.message : 'Enter the App Store URL'}
//               required
//             />
//             <ValidatedTextField
//               name="playStoreLink"
//               control={control}
//               label="Play Store Link"
//               errors={errors}
//               rules={{ required: 'Play Store Link is required' }}
//               helperText={errors.playStoreLink ? errors.playStoreLink.message : 'Enter the Play Store URL'}
//               required
//             />
//           </FormRow>

//           <FormRow cols={3}>
//             <div>
//               <ValidatedLabel label="Select Logo" required />
//               <ImageUploadField
//                 name="logo"
//                 control={control}
//                 label="Logo"
//                 errors={errors}
//                 value={fileInput}
//                 imgSrc={imgSrc}
//                 rules={{ required: 'Logo is required' }}
//                 helperText={errors.logo ? errors.logo.message : 'Upload a logo image'}
//                 handleFileInputReset={handleFileInputReset}
//                 handleFileInputChangeBanner={handleFileInputChangeBanner}
//                 isUploading={isUploadingBanner}
//               />
//             </div>
//             <ValidatedTextArea
//               name="description"
//               control={control}
//               label="Description"
//               errors={errors}
//               rows={3}
//               rules={{ required: false }}
//               helperText={errors.description ? errors.description.message : 'Enter a brief description'}
//               required
//             />
//           </FormRow>
//         </div>

//         {/* Advanced Fields */}
//         <div className="w-full join join-vertical bg-base-100">
//           <div className="collapse collapse-arrow join-item border-base-300 border">
//             <input
//               type="checkbox"
//               checked={openAdvanced}
//               onChange={() => setOpenAdvanced(!openAdvanced)}
//             />
//             <div className="collapse-title font-semibold">Advanced Fields</div>
//             <div className="collapse-content text-sm">
//               <div className="space-y-4">
//                 <FormRow cols={3}>
//                   <ValidatedTextField
//                     name="startingInterestRate"
//                     control={control}
//                     label="Starting Interest Rate"
//                     errors={errors}
//                     rules={{ required: false }} // Made optional for flexibility
//                     helperText={errors.startingInterestRate ? 'Starting Interest Rate required!' : ''}
//                   />
//                   <ValidatedTextField
//                     name="processingFee"
//                     control={control}
//                     label="Processing Fee"
//                     errors={errors}
//                     helperText={errors.processingFee ? 'Processing Fee required!' : ''}
//                   />
//                   <ValidatedTextField
//                     name="maximumLoanAmount"
//                     control={control}
//                     label="Maximum Loan Amount"
//                     errors={errors}
//                     helperText={errors.maximumLoanAmount ? 'Maximum Loan Amount required!' : ''}
//                   />
//                   <ValidatedTextField
//                     name="minimumLoanAmount"
//                     control={control}
//                     label="Minimum Loan Amount"
//                     errors={errors}
//                     helperText={errors.minimumLoanAmount ? 'Minimum Loan Amount required!' : ''}
//                   />
//                   <ValidatedTextField
//                     name="maximumTenure"
//                     control={control}
//                     label="Maximum Tenure"
//                     errors={errors}
//                     helperText={errors.maximumTenure ? 'Maximum Tenure required!' : ''}
//                   />
//                   <ValidatedTextField
//                     name="minimumTenure"
//                     control={control}
//                     label="Minimum Tenure"
//                     errors={errors}
//                     helperText={errors.minimumTenure ? 'Minimum Tenure required!' : ''}
//                   />
//                   <ValidatedTextField
//                     name="prepaymentCharges"
//                     control={control}
//                     label="Prepayment Charges"
//                     errors={errors}
//                     helperText={errors.prepaymentCharges ? 'Prepayment Charges required!' : ''}
//                   />
//                   <ValidatedTextField
//                     name="latePaymentCharges"
//                     control={control}
//                     label="Late Payment Charges"
//                     errors={errors}
//                     helperText={errors.latePaymentCharges ? 'Late Payment Charges required!' : ''}
//                   />
//                   <ValidatedTextField
//                     name="foreclosureCharges"
//                     control={control}
//                     label="Foreclosure Charges"
//                     errors={errors}
//                     helperText={errors.foreclosureCharges ? 'Foreclosure Charges required!' : ''}
//                   />
//                   <ValidatedTextArea
//                     name="eligibilityCriteria"
//                     control={control}
//                     label="Eligibility Criteria"
//                     errors={errors}
//                     rows={3}
//                     helperText={errors.eligibilityCriteria ? 'Eligibility Criteria required!' : ''}
//                   />
//                 </FormRow>
//               </div>

//               <div className="mt-8 space-y-4">
//                 <FormRow cols={3}>
//                   <ValidatedTextField
//                     name="customerSupportNumber"
//                     control={control}
//                     label="Customer Support Number"
//                     errors={errors}
//                     helperText={errors.customerSupportNumber ? 'Customer Support Number required!' : ''}
//                   />
//                   <ValidatedTextField
//                     name="customerSupportEmail"
//                     control={control}
//                     label="Customer Support Email"
//                     errors={errors}
//                     helperText={errors.customerSupportEmail ? 'Customer Support Email required!' : ''}
//                   />
//                   <ValidatedTextField
//                     name="termsAndConditionsLink"
//                     control={control}
//                     label="Terms & Conditions Link"
//                     errors={errors}
//                     helperText={errors.termsAndConditionsLink ? 'Terms & Conditions Link required!' : ''}
//                   />
//                 </FormRow>

//                 <FormRow cols={3}>
//                   <ValidatedTextField
//                     name="privacyPolicyLink"
//                     control={control}
//                     label="Privacy Policy Link"
//                     errors={errors}
//                     helperText={errors.privacyPolicyLink ? 'Privacy Policy Link required!' : ''}
//                   />
//                   <ValidatedTextField
//                     name="faqLink"
//                     control={control}
//                     label="FAQ Link"
//                     errors={errors}
//                     helperText={errors.faqLink ? 'FAQ Link required!' : ''}
//                   />
//                   <ValidatedTextField
//                     name="aboutUsLink"
//                     control={control}
//                     label="About Us Link"
//                     errors={errors}
//                     helperText={errors.aboutUsLink ? 'About Us Link required!' : ''}
//                   />
//                 </FormRow>

//                 <FormRow cols={3}>
//                   <ValidatedTextField
//                     name="sortedOrder"
//                     control={control}
//                     label="Sorted Order"
//                     errors={errors}
//                     helperText={errors.sortedOrder ? 'Sorted Order required!' : ''}
//                   />
//                 </FormRow>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end">
//           <SubmitBtn loading={loading} label={isEdit ? 'Update' : 'Submit'} />
//         </div>
//       </form>
//     </div>
//   );
// }


import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ValidatedTextField from '@components/Form/ValidatedTextField';
import ValidatedTextArea from '@components/Form/ValidatedTextArea';
import ValidatedLabel from '@components/Form/ValidatedLabel';
import SubmitBtn from '@components/Form/SubmitBtn';
import ImageUploadField from '@components/Form/ImageUploadField';
import FormRow from '@components/Form/FormRow';
import { uploadImage } from '../../../api-services/cms-services';
import ToastNotification from '../../../components/Notification/ToastNotification';
import { Toaster } from 'react-hot-toast';
import { AddLender } from '../../../api-services/Modules/LenderApi';

export default function LenderCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [openAdvanced, setOpenAdvanced] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerImageKey, setBannerImageKey] = useState('');
  const [imgSrc, setImgSrc] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
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
      termsAndConditionsLink: '',
      privacyPolicyLink: '',
      faqLink: '',
      aboutUsLink: '',
      sortedOrder: '',
    },
  });

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
      errors.termsAndConditionsLink ||
      errors.privacyPolicyLink ||
      errors.faqLink ||
      errors.aboutUsLink ||
      errors.sortedOrder
    ) {
      setOpenAdvanced(true);
    }
  }, [errors]);

  const handleFileInputChangeBanner = async (e) => {
    console.log('Image upload triggered');
    try {
      const file = e.target.files[0];
      if (!file) {
        ToastNotification.error('No file selected.');
        return;
      }
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        setImgSrc(img.src);
        const formData = new FormData();
        formData.append('image_type', 'onBoardLender');
        formData.append('image', file);
        try {
          setLoading(true);
          setIsUploadingBanner(true);
          const response = await uploadImage(formData);
          console.log('Image Upload Response:', response.data.data.path);
          const imagePath = response?.data?.data?.path;
          setBannerImageKey(imagePath);
          setValue('logo', imagePath); // Update form state
          ToastNotification.success('Image uploaded successfully');
        } catch (uploadError) {
          console.error('Upload Error:', uploadError);
          ToastNotification.error('Error uploading image.');
        } finally {
          setLoading(false);
          setIsUploadingBanner(false);
        }
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        ToastNotification.error('Error loading image.');
        setValue('logo', '');
      };
    } catch (err) {
      console.error('Image Error:', err);
      ToastNotification.error('An unexpected error occurred.');
      setValue('logo', '');
    }
  };

  const handleFileInputReset = () => {
    setImgSrc('');
    setBannerImageKey('');
    setValue('logo', ''); // Reset logo in form state
  };

  const onSubmit = async (data) => {
    const submittedData = { 
      ...data, 
      logo: bannerImageKey 
    };
  
    if (Object.keys(errors).length > 0) {
      ToastNotification.error('Please fill all required fields.');
      return;
    }
    if (!bannerImageKey) {
      ToastNotification.error('Please upload a logo image.');
      return;
    }
    setLoading(true);
    try {
      const response = await AddLender(submittedData);
      console.log('API Response:', response);
      if (response?.data?.success) {
        ToastNotification.success('Lender Added Successfully');
        navigate('/list-of-lenders');
      } else {
        ToastNotification.error(`Failed to add lender: ${response?.data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('AddLender Error:', error.response?.data || error.message);
      ToastNotification.error(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Toaster />
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
              rules={{ required: 'Lender name is required' }}
              helperText={errors.name ? errors.name.message : 'Enter the lender’s name'}
              required
            />
            {/* <ValidatedTextField
              name="slug"
              control={control}
              label="Slug"
              errors={errors}
              rules={{ required: false }} // Made optional to match Postman JSON
              helperText={errors.slug ? errors.slug.message : 'Enter a unique slug (optional)'}
            /> */}
            <ValidatedTextField
              name="website"
              control={control}
              label="Website"
              errors={errors}
              rules={{ required: 'Website is required' }}
              helperText={errors.website ? errors.website.message : 'Enter the lender’s website URL'}
              required
            />
          </FormRow>

          <FormRow cols={3}>
            <ValidatedTextField
              name="appStoreLink"
              control={control}
              label="App Store Link"
              errors={errors}
              rules={{ required: 'App Store Link is required' }}
              helperText={errors.appStoreLink ? errors.appStoreLink.message : 'Enter the App Store URL'}
              required
            />
            <ValidatedTextField
              name="playStoreLink"
              control={control}
              label="Play Store Link"
              errors={errors}
              rules={{ required: 'Play Store Link is required' }}
              helperText={errors.playStoreLink ? errors.playStoreLink.message : 'Enter the Play Store URL'}
              required
            />
          </FormRow>

          <FormRow cols={3}>
            <div>
              <ValidatedLabel label="Select Logo" required />
              <ImageUploadField
                name="logo"
                control={control}
                label="Logo"
                errors={errors}
                imgSrc={imgSrc}
                rules={{ required: 'Logo is required' }}
                helperText={errors.logo ? errors.logo.message : 'Upload a logo image'}
                handleFileInputReset={handleFileInputReset}
                handleFileInputChangeBanner={handleFileInputChangeBanner}
                isUploading={isUploadingBanner}
              />
            </div>
            <ValidatedTextArea
              name="description"
              control={control}
              label="Description"
              errors={errors}
              rows={3}
              rules={{ required: 'Description is required' }} // Fixed to match Postman JSON
              helperText={errors.description ? errors.description.message : 'Enter a brief description'}
              required
            />
          </FormRow>
        </div>

        {/* Advanced Fields */}
        <div className="w-full join join-vertical bg-base-100">
          <div className="collapse collapse-arrow join-item border-base-300 border">
            <input
              type="checkbox"
              checked={openAdvanced}
              onChange={() => setOpenAdvanced(!openAdvanced)}
            />
            <div className="collapse-title font-semibold">Advanced Fields</div>
            <div className="collapse-content text-sm">
              <div className="space-y-4">
                <FormRow cols={3}>
                  <ValidatedTextField
                    name="startingInterestRate"
                    control={control}
                    label="Starting Interest Rate"
                    errors={errors}
                    rules={{ required: 'Starting Interest Rate is required' }} // Fixed to match Postman JSON
                    helperText={errors.startingInterestRate ? errors.startingInterestRate.message : ''}
                    required
                  />
                  <ValidatedTextField
                    name="processingFee"
                    control={control}
                    label="Processing Fee"
                    errors={errors}
                    rules={{ required: 'Processing Fee is required' }} // Fixed to match Postman JSON
                    helperText={errors.processingFee ? errors.processingFee.message : ''}
                    required
                  />
                  <ValidatedTextField
                    name="maximumLoanAmount"
                    control={control}
                    label="Maximum Loan Amount"
                    errors={errors}
                    rules={{ required: 'Maximum Loan Amount is required' }}
                    helperText={errors.maximumLoanAmount ? errors.maximumLoanAmount.message : ''}
                    required
                  />
                  <ValidatedTextField
                    name="minimumLoanAmount"
                    control={control}
                    label="Minimum Loan Amount"
                    errors={errors}
                    rules={{ required: 'Minimum Loan Amount is required' }}
                    helperText={errors.minimumLoanAmount ? errors.minimumLoanAmount.message : ''}
                    required
                  />
                  <ValidatedTextField
                    name="maximumTenure"
                    control={control}
                    label="Maximum Tenure"
                    errors={errors}
                    rules={{ required: 'Maximum Tenure is required' }}
                    helperText={errors.maximumTenure ? errors.maximumTenure.message : ''}
                    required
                  />
                  <ValidatedTextField
                    name="minimumTenure"
                    control={control}
                    label="Minimum Tenure"
                    errors={errors}
                    rules={{ required: 'Minimum Tenure is required' }}
                    helperText={errors.minimumTenure ? errors.minimumTenure.message : ''}
                    required
                  />
                  <ValidatedTextField
                    name="prepaymentCharges"
                    control={control}
                    label="Prepayment Charges"
                    errors={errors}
                    rules={{ required: 'Prepayment Charges is required' }}
                    helperText={errors.prepaymentCharges ? errors.prepaymentCharges.message : ''}
                    required
                  />
                  <ValidatedTextField
                    name="latePaymentCharges"
                    control={control}
                    label="Late Payment Charges"
                    errors={errors}
                    rules={{ required: 'Late Payment Charges is required' }}
                    helperText={errors.latePaymentCharges ? errors.latePaymentCharges.message : ''}
                    required
                  />
                  <ValidatedTextField
                    name="foreclosureCharges"
                    control={control}
                    label="Foreclosure Charges"
                    errors={errors}
                    rules={{ required: 'Foreclosure Charges is required' }}
                    helperText={errors.foreclosureCharges ? errors.foreclosureCharges.message : ''}
                    required
                  />
                  <ValidatedTextArea
                    name="eligibilityCriteria"
                    control={control}
                    label="Eligibility Criteria"
                    errors={errors}
                    rows={3}
                    rules={{ required: 'Eligibility Criteria is required' }}
                    helperText={errors.eligibilityCriteria ? errors.eligibilityCriteria.message : ''}
                    required
                  />
                </FormRow>
              </div>

              <div className="mt-8 space-y-4">
                <FormRow cols={3}>
                  <ValidatedTextField
                    name="customerSupportNumber"
                    control={control}
                    label="Customer Support Number"
                    errors={errors}
                    rules={{ required: 'Customer Support Number is required' }}
                    helperText={errors.customerSupportNumber ? errors.customerSupportNumber.message : ''}
                    required
                  />
                  <ValidatedTextField
                    name="customerSupportEmail"
                    control={control}
                    label="Customer Support Email"
                    errors={errors}
                    rules={{ required: 'Customer Support Email is required' }}
                    helperText={errors.customerSupportEmail ? errors.customerSupportEmail.message : ''}
                    required
                  />
                  <ValidatedTextField
                    name="termsAndConditionsLink"
                    control={control}
                    label="Terms & Conditions Link"
                    errors={errors}
                    rules={{ required: 'Terms & Conditions Link is required' }}
                    helperText={errors.termsAndConditionsLink ? errors.termsAndConditionsLink.message : ''}
                    required
                  />
                </FormRow>

                <FormRow cols={3}>
                  <ValidatedTextField
                    name="privacyPolicyLink"
                    control={control}
                    label="Privacy Policy Link"
                    errors={errors}
                    rules={{ required: 'Privacy Policy Link is required' }}
                    helperText={errors.privacyPolicyLink ? errors.privacyPolicyLink.message : ''}
                    required
                  />
                  <ValidatedTextField
                    name="faqLink"
                    control={control}
                    label="FAQ Link"
                    errors={errors}
                    rules={{ required: 'FAQ Link is required' }}
                    helperText={errors.faqLink ? errors.faqLink.message : ''}
                    required
                  />
                  <ValidatedTextField
                    name="aboutUsLink"
                    control={control}
                    label="About Us Link"
                    errors={errors}
                    rules={{ required: 'About Us Link is required' }}
                    helperText={errors.aboutUsLink ? errors.aboutUsLink.message : ''}
                    required
                  />
                </FormRow>

                <FormRow cols={3}>
                  <ValidatedTextField
                    name="sortedOrder"
                    control={control}
                    label="Sorted Order"
                    errors={errors}
                    rules={{ required: 'Sorted Order is required' }}
                    helperText={errors.sortedOrder ? errors.sortedOrder.message : ''}
                    required
                  />
                </FormRow>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <SubmitBtn loading={loading} label={isEdit ? 'Update' : 'Submit'} />
        </div>
      </form>
    </div>
  );
}