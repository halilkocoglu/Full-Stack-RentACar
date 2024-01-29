import React from "react";
import { useEffect, useState } from "react";
import { RentalModel } from "../../../models/RentalModel";
import axiosInstance from "../../../utils/interceptors/axiosInterceptors";
import { toast } from "react-toastify";
import * as Yup from "yup";
import FormikInput from "../../FormikInput/FormikInput";
import { Form, Formik, FormikHelpers } from "formik";
import Pagination from "../../Pagination/Pagination";
import { ModelType } from "../../../models/ModelType";
import FormikSelect from "../../FormikSelect/FormikSelect";
import { useTranslation } from "react-i18next";

type Props = { model?: ModelType; setEditable: any; urlType: string };

const ModelAddUpdate = ({ model, setEditable, urlType }: Props) => {
  const [brandList, setBrandList] = useState<any[]>([]);
  const { t } = useTranslation();
  const fetchBrands = async () => {
    try {
      const response = await axiosInstance.get(`v1/brands`);
      setBrandList(response.data);
    } catch (error: any) {
      toast.error(error?.response.data.message);
    }
  };
  const handleUpdateModel = async (
    values: ModelType,
    { setErrors }: FormikHelpers<ModelType>
  ) => {
    console.log(values);

    let response;

    try {
      if (urlType === "put") {
        response = await axiosInstance.put(`/v1/models`, values);
      }else{ response = await axiosInstance.post(`/v1/models`, values);}

      toast.success("Model updated successfully");
      console.log(response);
      setEditable(false);

      setInitialValues({
        id: 1,
        name: "",
        brandId: 0,
      });
    } catch (error: any) {
      if (error.response.data.validationErrors) {
        
        const validationErrors: Record<string, string> =
          error.response.data.validationErrors;
        const formikErrors: Record<string, string> = {};
        Object.entries(validationErrors).forEach(([field, message]) => {
          formikErrors[field] = message;
        });
        setErrors(formikErrors);
        console.log(error);
      } else {
        toast.error(error.response.data.message);
      }
    }
  };
  const [initialValues, setInitialValues] = useState<ModelType>(
    model || {
      id: 1,
      name: "",
      brandId: 0,
    }
  );

  const validationSchema = Yup.object({
    name: Yup.string().required(" is required"),
    brandId: Yup.string().required(" is required"),
  });
  const onChangeInput = (handleChange: any, e: any, values: any) => {
    handleChange(e);
    setInitialValues({ ...values, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    fetchBrands();
  }, [])
  
  return (
    <div>
      {" "}
      <div
        style={{ minHeight: "80vh" }}
        className="d-flex flex-row justify-content-center align-items-center   "
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleUpdateModel}
        >
          {({ isSubmitting, values, handleChange }) => (
            <Form className="  w-50">
              <div>
                <FormikInput
                  label=" Model Name"
                  onChange={(e: any) => {
                    onChangeInput(handleChange, e, values);
                  }}
                  value={initialValues.name}
                  name="name"
                />
              </div>

              <div>
                <FormikSelect
                  label="Brand Name"
                  list={brandList}
                  name="brandId"
                  val={"id"}
                />
              </div>
              <div className="col  d-flex justify-content-between">
                <button
                type="button"
                  onClick={() => setEditable(false)}
                  className="btn btn-danger "
                >
                  {t("giveup")}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary "
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ModelAddUpdate;
