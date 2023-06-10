var tableNumber = null;

AFRAME.registerComponent("markerhandler", {
  init: async function () {
    if (tableNumber === null) {
      this.askTableNumber();
    }

    var toys = await this.getToys();

    this.el.addEventListener("markerFound", () => {
      if (tableNumber !== null) {
        var markerId = this.el.id;
        this.handleMarkerFound(toys, markerId);
      }
    });
    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },

  askTableNumber: function () {
    var iconUrl =
      "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal({
      title: "Welcome to Hunger!!",
      icon: iconUrl,
      content: {
        element: "input",
        attributes: {
          placeholder: "Type your table number",
          type: "number",
          min: 1,
        },
      },
      closeOnClickOutside: false,
    }).then((inputValue) => {
      tableNumber = inputValue;
    });
  },

  handleMarkerFound: function (toys, markerId) {
    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();

    var days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    var toy = toys.filter((toy) => toy.ID === markerId)[0];

    if (toy.UNAVAILABLE_DAYS.includes(days[todaysDay])) {
      swal({
        icon: "warning",
        title: toy.toy_name.toUpperCase(),
        text: "This toy is not available today!!!",
        timer: 2500,
        buttons: false,
      });
    } else {
      var model = document.querySelector(`#model-${toy.ID}`);
      model.setAttribute("position", toy.MODEL_GEOMETRY.POSN);
      model.setAttribute("rotation", toy.MODEL_GEOMETRY.ROTN);
      model.setAttribute("scale", toy.MODEL_GEOMETRY.SCALE);

      model.setAttribute("visible", true);

      var listContainer = document.querySelector(
        `#main-plane-${toy.ID}`
      );
      listsContainer.setAttribute("visible", true);

  
      var priceplane = document.querySelector(`#price-plane-${toy.ID}`);
      priceplane.setAttribute("visible", true);

      var ratingPlane = document.querySelector(`#rating-plane-${toy.ID}`);
      ratingPlane.setAttribute("visible", true);

      var reviewPlane = document.querySelector(`#review-plane-${toy.ID}`);
      reviewPlane.setAttribute("visible", true);

      model.setAttribute("position", toy.model_geometry.position);
      model.setAttribute("rotation", toy.model_geometry.rotation);
      model.setAttribute("scale", toy.model_geometry.scale);


      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButtton = document.getElementById("order-button");
      var orderSummaryButtton = document.getElementById("order-summary-button");
      var payButton = document.getElementById("pay-button");

      ratingButton.addEventListener("click", () => this.handleRatings(toy));

      orderButtton.addEventListener("click", () => {
        var tNumber;
        tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;
        this.handleOrder(tNumber, toy);

        swal({
          icon: "https://i.imgur.com/4NZ6uLY.jpg",
          title: "Thanks For Order !",
          text: "Your order will serve soon on your table!",
          timer: 2000,
          buttons: false,
        });
      });

      orderSummaryButtton.addEventListener("click", () =>
        this.handleOrderSummary()
      );

      payButton.addEventListener("click", () => this.handlePayment());
    }
  },


  handleOrder: function (tNumber, toy) {
    firebase
      .firestore()
      .collection("TABLES")
      .doc(tNumber)
      .get()
      .then((doc) => {
        var details = doc.data();

        if (details["CURRENT_ORDERS"][toy.ID]) {
          details["CURRENT_ORDERS"][toy.ID]["QUANTITY"] += 1;

          var currentQuantity = details["CURRENT_ORDERS"][toy.ID]["QUANTITY"];

          details["CURRENT_ORDERS"][toy.ID]["SUBTOTAL"] =
            currentQuantity * toy.PRICE;
        } else {
          details["CURRENT_ORDERS"][toy.ID] = {
            ITEM: toy.TOY_NAME,
            PRICE: toy.PRICE,
            QUANTITY: 1,
            SUBTOTAL: toy.PRICE * 1,
          };
        }

        details.TOTAL_BILL += toy.PRICE;

        firebase.firestore().collection("TABLES").doc(doc.ID).update(details);
      });
  },


  getToys: async function () {
    return await firebase
      .firestore()
      .collection("TOYS")
      .get()
      .then((snap) => {
        return snap.docs.map((doc) => doc.data());
      });
  },

  getOrderSummary: async function (tNumber) {
    return await firebase
      .firestore()
      .collection("TABLES")
      .doc(tNumber)
      .get()
      .then((doc) => doc.data());
  },
  handleOrderSummary: async function () {
    var tNumber;
    tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;

    var orderSummary = await this.getOrderSummary(tNumber);

    var modalDiv = document.getElementById("modal-div");

    modalDiv.style.display = "flex";

    var tableBodyTag = document.getElementById("bill-table-body");

    tableBodyTag.innerHTML = "";

    var currentOrders = Object.keys(orderSummary.CURRENT_ORDERS);

    currentOrders.map((i) => {
      var tr = document.createElement("tr");

      var item = document.createElement("td");
      var price = document.createElement("td");
      var quantity = document.createElement("td");
      var subtotal = document.createElement("td");

      item.innerHTML = orderSummary.CURRENT_ORDERS[i].ITEM;

      price.innerHTML = "$" + orderSummary.CURRENT_ORDERS[i].PRICE;
      price.setAttribute("class", "text-center");

      quantity.innerHTML = orderSummary.CURRENT_ORDERS[i].QUANTITY;
      quantity.setAttribute("class", "text-center");

      subtotal.innerHTML = "$" + orderSummary.CURRENT_ORDERS[i].SUBTOTAL;
      subtotal.setAttribute("class", "text-center");

      tr.appendChild(item);
      tr.appendChild(price);
      tr.appendChild(quantity);
      tr.appendChild(subtotal);

      tableBodyTag.appendChild(tr);
    });

    var totalTr = document.createElement("tr");

    var td1 = document.createElement("td");
    td1.setAttribute("class", "no-line");

    var td2 = document.createElement("td");
    td1.setAttribute("class", "no-line");

    var td3 = document.createElement("td");
    td1.setAttribute("class", "no-line text-center");

    var strongTag = document.createElement("strong");
    strongTag.innerHTML = "Total";

    td3.appendChild(strongTag);

    var td4 = document.createElement("td");
    td1.setAttribute("class", "no-line text-right");
    td4.innerHTML = "$" + orderSummary.total_bill;

    totalTr.appendChild(td1);
    totalTr.appendChild(td2);
    totalTr.appendChild(td3);
    totalTr.appendChild(td4);

    tableBodyTag.appendChild(totalTr);
  },

  handlePayment: function () {
    document.getElementById("modal-div").style.display = "none";

    var tNumber;
    tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;

    firebase
      .firestore()
      .collection("TABLES")
      .doc(tNumber)
      .update({
        CURRENT_ORDERS: {},
        TOTAL_BILL: 0,
      })
      .then(() => {
        swal({
          icon: "success",
          title: "Thanks For Paying !",
          text: "We Hope You Enjoyed Your Food !!",
          timer: 2500,
          buttons: false,
        });
      });
  },
  handleRatings: async function (toy) {
    var tNumber;
    tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;

    var orderSummary = await this.getOrderSummary(tNumber);

    var currentOrders = Object.keys(orderSummary.CURRENT_ORDERS);

    if (currentOrders.length > 0 && toy.ID) {
      document.getElementById("rating-modal-div").style.display = "flex";
      document.getElementById("rating-input").value = "0";
      document.getElementById("feedback-input").value = "";

      var saveRatingButton = document.getElementById("save-rating-button");

      saveRatingButton.addEventListener("click", () => {
        document.getElementById("rating-modal-div").style.display = "none";
        var rating = document.getElementById("rating-input").value;
        var feedback = document.getElementById("feedback-input").value;

        firebase
          .firestore()
          .collection("TOYS")
          .doc(toy.ID)
          .update({
            LAST_REVIEW: feedback,
            LAST_RATING: rating,
          })
          .then(() => {
            swal({
              icon: "success",
              title: "Thanks For Rating!",
              text: "We Hope You Like Your Toy !!",
              timer: 2500,
              buttons: false,
            });
          });
      });
    } else {
      swal({
        icon: "warning",
        title: "Oops!",
        text: "No toy found to give ratings!!",
        timer: 2500,
        buttons: false,
      });
    }
  },

  handleMarkerLost: function () {
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  },
});
