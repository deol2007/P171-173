AFRAME.registerComponent("create-markers", {
  init: async function () {
    var mainScene = document.querySelector("#main-scene");
    var toys = await this.getToys();

    toys.map(toy => {
      var marker = document.createElement("a-marker");
      marker.setAttribute("id", toy.id);
      marker.setAttribute("type", "pattern");
      marker.setAttribute("url", toy.marker_pattern_url);
      marker.setAttribute("cursor", {
        rayOrigin: "mouse"
      });
      marker.setAttribute("markerhandler", {});
      mainScene.appendChild(marker);

      var todaysDate = new Date();
      var todaysDay = todaysDate.getDay();

      var days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
      ];

      if (!toy.unavailable_days.includes(days[todaysDay])) {

        var model = document.createElement("a-entity");
        model.setAttribute("id", `model-${toy.id}`);
        model.setAttribute("position", toy.model_geometry.position);
        model.setAttribute("rotation", toy.model_geometry.rotation);
        model.setAttribute("scale", toy.model_geometry.scale);
        model.setAttribute("gltf-model", `url(${toy.model_url})`);
        model.setAttribute("gesture-handler", {});
        model.setAttribute("visible", false);
        marker.appendChild(model);

        var mainPlane = document.createElement("a-plane");
        mainPlane.setAttribute("id", `main-plane-${toy.id}`);
        mainPlane.setAttribute("position", { x: 0, y: 0, z: 0 });
        mainPlane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
        mainPlane.setAttribute("width", 1.7);
        mainPlane.setAttribute("height", 1.5);
        mainPlane.setAttribute("visible", false);
        marker.appendChild(mainPlane);

        var titlePlane = document.createElement("a-plane");
        titlePlane.setAttribute("id", `title-plane-${toy.id}`);
        titlePlane.setAttribute("position", { x: 0, y: 0.89, z: 0.02 });
        titlePlane.setAttribute("rotation", { x: 0, y: 0, z: 0 });
        titlePlane.setAttribute("width", 1.69);
        titlePlane.setAttribute("height", 0.3);
        titlePlane.setAttribute("material", { color: "#F0C30F" });
        mainPlane.appendChild(titlePlane);

        var toyTitle = document.createElement("a-entity");
        toyTitle.setAttribute("id", `toy-title-${toy.id}`);
        toyTitle.setAttribute("position", { x: 0, y: 0, z: 0.1 });
        toyTitle.setAttribute("rotation", { x: 0, y: 0, z: 0 });
        toyTitle.setAttribute("text", {
          font: "monoid",
          color: "black",
          width: 1.8,
          height: 1,
          align: "center",
          value: toy.toy_name.toUpperCase()
        });
        titlePlane.appendChild(toyTitle);

        var lists = document.createElement("a-entity");
        lists.setAttribute("id", `lists-${toy.id}`);
        lists.setAttribute("position", { x: 0.3, y: 0, z: 0.1 });
        lists.setAttribute("rotation", { x: 0, y: 0, z: 0 });
        lists.setAttribute("text", {
          font: "monoid",
          color: "black",
          width: 2,
          align: "left",
          value: `${toy.lists.join("\n\n")}`
        });
        mainPlane.appendChild(lists);

        var pricePlane = document.createElement("a-image");
        pricePlane.setAttribute("id", `price-plane-${toy.id}`);
        pricePlane.setAttribute(
          "src", "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/black-circle.png"
        );
        pricePlane.setAttribute("width", 0.8);
        pricePlane.setAttribute("height", 0.8);
        pricePlane.setAttribute("position", { x: -1.3, y: 0, z: 0.3 });
        pricePlane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
        pricePlane.setAttribute("visible", false);

        var price = document.createElement("a-entity");
        price.setAttribute("id", `price-${toy.id}`);
        price.setAttribute("position", { x: 0.03, y: 0.05, z: 0.1 });
        price.setAttribute("rotation", { x: 0, y: 0, z: 0 });
        price.setAttribute("text", {
          font: "mozillavr",
          color: "white",
          width: 3,
          align: "center",
          value: `Only\n $${toy.price}`
        });


        pricePlane.appendChild(price);
        marker.appendChild(pricePlane);

          var ratingPlane = document.createElement("a-entity");
          ratingPlane.setAttribute("id", `rating-plane-${toy.id}`);
          ratingPlane.setAttribute("position", { x: 2, y: 0, z: 0.5 });
          ratingPlane.setAttribute("geometry", {
            primitive: "plane",
            width: 1.5,
            height: 0.3
          });
  
          ratingPlane.setAttribute("material", {
            color: "#F0C30F"
          });
          ratingPlane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
          ratingPlane.setAttribute("visible", false);
  
          var rating = document.createElement("a-entity");
          rating.setAttribute("id", `rating-${toy.id}`);
          rating.setAttribute("position", { x: 0, y: 0.05, z: 0.1 });
          rating.setAttribute("rotation", { x: 0, y: 0, z: 0 });
          rating.setAttribute("text", {
            font: "mozillavr",
            color: "black",
            width: 2.4,
            align: "center",
            value: `Customer Rating: ${toy.last_rating}`
          });
  
          ratingPlane.appendChild(rating);
          marker.appendChild(ratingPlane);

        var reviewPlane = document.createElement("a-entity");
        reviewPlane.setAttribute("id", `review-plane-${toy.id}`);
        reviewPlane.setAttribute("position", { x: 2, y: 0, z: 0 });
        reviewPlane.setAttribute("geometry", {
          primitive: "plane",
          width: 1.5,
          height: 0.5
        });

        reviewPlane.setAttribute("material", {
          color: "#F0C30F"
        });
        reviewPlane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
        reviewPlane.setAttribute("visible", false);

        var review = document.createElement("a-entity");
        review.setAttribute("id", `review-${toy.id}`);
        review.setAttribute("position", { x: 0, y: 0.05, z: 0.1 });
        review.setAttribute("rotation", { x: 0, y: 0, z: 0 });
        review.setAttribute("text", {
          font: "mozillavr",
          color: "black",
          width: 2.4,
          align: "center",
          value: `Customer Review: \n${toy.last_review}`
        });
        
        reviewPlane.appendChild(review);
        marker.appendChild(reviewPlane);
      }
    });
  },

  getToys: async function () {
    return await firebase
      .firestore()
      .collection("toys")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  }
});