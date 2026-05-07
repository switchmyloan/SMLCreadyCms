import React, { useState } from "react";
import Drawer from "../../components/Drawer";
import { useForm } from "react-hook-form";
import ValidatedTextField from "@components/Form/ValidatedTextField";
import ValidatedLabel from "@components/Form/ValidatedLabel";
import ValidatedSearchableSelectField from "@components/Form/ValidatedSearchableSelectField";

const loanTypes = [
  { label: "Instant Personal Loan", value: "instant-personal-loan" },
  { label: "Emergency Loan", value: "emergency-expense-loan" },
  { label: "Debt Consolidation Loan", value: "debt-consolidation-loan" },
];

const CityPages = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

const {
  control,
  handleSubmit,
  reset,
  formState: { errors },
} = useForm({
    defaultValues: {
      title: "",
      slug: "",
      loan_type: "",
      city: "",
      hero_title: "",
      hero_description: "",
      faq_category: "",
    },
  });

  const onSubmit = async (data) => {
    console.log("PAGE DATA 👉", data);

    // TODO: connect API later
    // await createPage(data)

    setIsModalOpen(false);
    reset();
  };

  return (
    <>
      <div className="p-6">
        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Create Page
        </button>
      </div>

      <Drawer
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create City Page"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Title */}
          <ValidatedTextField
            name="title"
            control={control}
            label="Page Title"
              errors={errors}
            placeholder="Instant Personal Loan in Ahmedabad"
          />

          {/* Slug */}
          <ValidatedTextField
            name="slug"
            control={control}
            label="Slug"
              errors={errors}
            placeholder="instant-personal-loan-ahmedabad"
          />

          {/* Loan Type */}
          <div>
            <ValidatedLabel label="Loan Type" />
            <ValidatedSearchableSelectField
              name="loan_type"
              control={control}
              options={loanTypes}
              errors={errors}
              placeholder="Select loan type"
            />
          </div>

          {/* City */}
          <ValidatedTextField
            name="city"
            control={control}
            label="City"
              errors={errors}
            placeholder="Ahmedabad"
          />

          {/* Hero Title */}
          <ValidatedTextField
            name="hero_title"
            control={control}
            label="Hero Title"
              errors={errors}
            placeholder="Instant Personal Loan Ahmedabad"
          />

          {/* Hero Description */}
          <ValidatedTextField
            name="hero_description"
            control={control}
            label="Hero Description"
              errors={errors}
            placeholder="Write short description..."
          />

          {/* FAQ Category */}
          <ValidatedTextField
            name="faq_category"
            control={control}
            label="FAQ Category"
              errors={errors}
            placeholder="ipl_ahmedabad"
          />

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              className="btn"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary">
              Create Page
            </button>
          </div>
        </form>
      </Drawer>
    </>
  );
};

export default CityPages;