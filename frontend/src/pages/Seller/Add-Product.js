import { faBox, faDashboard } from "@fortawesome/free-solid-svg-icons";
import DOMPurify from "dompurify"; // Import DOMPurify for sanitizing input
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import SideMenu from "../../components/SideMenu";
import { useBackendAPI } from "../../context/useBackendAPI";
import { UseUserContext } from "../../context/useUserContext";

export default function AddProduct() {
  const { user1 } = UseUserContext();
  const { saveProduct, getStoreName } = useBackendAPI();

  const [image, setProductPicture] = useState("");
  const [error, setError] = useState(""); // State to handle errors

  function convertToBase64(e) {
    const file = e.target.files[0];
    if (file && file.size < 500000) {
      // Limit file size to 500KB (adjust as needed)
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setProductPicture(reader.result);
      reader.onerror = (error) => console.log("error: ", error);
    } else {
      setError("File is too large. Please upload a smaller image.");
    }
  }

  const itemName = useRef(),
    description = useRef(),
    price = useRef(),
    quantity = useRef(),
    discount = useRef(),
    imageInputRef = useRef(null);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Get the store name based on the storeID
    const storeName = await getStoreName(user1[0].storeID);

    // Sanitize inputs
    const sanitizedItemName = DOMPurify.sanitize(itemName.current.value.trim());
    const sanitizedDescription = DOMPurify.sanitize(
      description.current.value.trim()
    );
    const sanitizedPrice = parseFloat(price.current.value); // Ensure price is a number
    const sanitizedQuantity = parseInt(quantity.current.value, 10); // Ensure quantity is a number
    const sanitizedDiscount = parseFloat(discount.current.value); // Ensure discount is a number

    // Validate inputs before submitting
    if (!sanitizedPrice || sanitizedPrice <= 0) {
      setError("Price must be a positive number.");
      return;
    }

    if (sanitizedDiscount < 0 || sanitizedDiscount > 100) {
      setError("Discount must be between 0 and 100.");
      return;
    }

    const data = await saveProduct({
      itemName: sanitizedItemName,
      description: sanitizedDescription,
      storeName,
      storeID: user1[0].storeID,
      price: sanitizedPrice,
      quantity: sanitizedQuantity,
      image,
      discount: sanitizedDiscount,
    });

    // Clear the form after submission
    itemName.current.value = "";
    description.current.value = "";
    price.current.value = "";
    quantity.current.value = "";
    discount.current.value = "";
    imageInputRef.current.value = "";
  };

  return (
    <div>
      <section className="sideMenu">
        <div className="logo">
          <Link
            to="/seller"
            style={{
              textDecoration: "none",
              color: "white",
              fontSize: 50,
              paddingTop: 20,
              display: "flex",
              justifyContent: "center",
            }}
          >
            RB&NS
          </Link>
        </div>
        <div className="items">
          <SideMenu to="/seller" icon={faDashboard} label="Dashboard" />
          <SideMenu to="/seller/product" icon={faBox} label="Products" />
        </div>
      </section>
      <section className="main-wrap">
        <div
          className="content-main"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div>
            <h2>Add New Product</h2>
            <p>Add your products here</p>
          </div>
          <div>
            <Link className="btn btn-primary" to={"/seller/product"}>
              Back
            </Link>
          </div>
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}{" "}
        {/* Display error if any */}
        <div className="card mb-4">
          <form onSubmit={onSubmitHandler}>
            <header className="card-header">
              <h4>Product</h4>
              <div>
                <input
                  className="btn btn-success"
                  type="submit"
                  value="Submit"
                />
              </div>
            </header>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="validationCustom01">Product title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="validationCustom01"
                    placeholder="Type here"
                    ref={itemName}
                    required
                  />
                  <div className="valid-feedback">Looks good!</div>
                </div>
                <div className="col">
                  <label htmlFor="validationCustom01">
                    Product description
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="validationCustom01"
                    placeholder="Type here"
                    ref={description}
                    required
                  />
                  <div className="valid-feedback">Looks good!</div>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="validationCustom01">Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    id="validationCustom01"
                    placeholder="0"
                    ref={quantity}
                    required
                    min="1"
                  />
                  <div className="valid-feedback">Looks good!</div>
                </div>
                <div className="col">
                  <label htmlFor="validationCustom01">Image</label>
                  <input
                    type="file"
                    className="form-control"
                    id="validationCustom01"
                    placeholder="0.00"
                    onChange={(e) => convertToBase64(e)}
                    ref={imageInputRef}
                    required
                  />
                  <div className="valid-feedback">Looks good!</div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="validationCustom01">Unit Price</label>
                  <input
                    type="number"
                    className="form-control"
                    id="validationCustom01"
                    placeholder="0.00"
                    ref={price}
                    required
                    min="0.01"
                    step="0.01"
                  />
                  <div className="valid-feedback">Looks good!</div>
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="validationCustom01">Discount</label>
                  <input
                    type="number"
                    className="form-control"
                    id="validationCustom01"
                    placeholder="0.00"
                    ref={discount}
                    required
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  <div className="valid-feedback">Looks good!</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
