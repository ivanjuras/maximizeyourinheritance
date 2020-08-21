Vue.config.devtools = true
Vue.use(VueMask.VueMaskPlugin)

var vm = new Vue({
  el: "#main-form",

  data: function () {
    return {
      endPointURL:
        "https://hook.integromat.com/o9fnxttmv489mtc9hgqvaj1ln0kq1hbp", // Change your endpoint URL here
      buttonText: "Next",
      showButton: true,
      smallerButtonSize: false,
      showConfirmation: false,
      formStep: 0,
      showError: false,
      city: "",
      stateAbbreviation: "",
      stateZipCode: "",
      finalObject: {},
      formStepData: [
        // 0
        {
          question: "Who is ill or deceased?",
          value: "",
          pattern: /[a-z0-9]/,
        },
        // 1
        {
          question: "Do they have a will?",
          value: "",
          pattern: /[a-z0-9]/,
        },
        // 2
        {
          question:
            "Are you in possession of the original will or do you have a copy?",
          value: "",
          pattern: /[a-z0-9]/,
        },
        // 3
        {
          question: "What assets do they possess?",
          value: [],
          pattern: /[a-z0-9]/,
        },
        // 4
        {
          question: "Total amount of their assets:",
          value: "",
          pattern: /[a-z0-9]/,
        },
        // 5
        {
          question: "Almost done!",
          firstName: "",
          lastName: "",
          zipCode: "",
          patternNames: /[a-z0-9]/,
          patternZip: /(^\d{5}$)|(^\d{5}-\d{4}$)/,
        },
        // 6
        {
          question: "Final Step!",
          phoneNumber: "",
          emailAddress: "",
          patternPhone: /^1?\s?(\([0-9]{3}\)[- ]?|[0-9]{3}[- ]?)[0-9]{3}[- ]?[0-9]{4}$/,
          patternEmail: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        },
      ],
    }
  },

  methods: {
    increaseFormStep: function () {
      if (this.formStep === 0) {
        this.fireStep0Data()
        this.scrollToTop()
      } else if (this.formStep === 1) {
        this.fireStep1Data()
        this.scrollToTop()
      } else if (this.formStep === 2) {
        this.fireStep2Data()
        this.scrollToTop()
      } else if (this.formStep === 3) {
        this.fireStep3Data()
        this.scrollToTop()
      } else if (this.formStep === 4) {
        this.fireStep4Data()
        this.scrollToTop()
      } else if (this.formStep === 5) {
        this.fireStep5Data()
        this.scrollToTop()
      } else if (this.formStep === 6) {
        this.fireStep6Data()
        this.scrollToTop()
      }
    },

    standardStepFire: function () {
      if (
        this.formStepData[this.formStep].pattern.test(
          this.formStepData[this.formStep].value
        )
      ) {
        this.formStep++
        this.showError = false
      } else {
        this.showError = true
      }
    },

    fireStep0Data: function () {
      this.standardStepFire()
    },

    fireStep1Data: function () {
      this.standardStepFire()
    },

    fireStep2Data: function () {
      this.standardStepFire()
    },

    fireStep3Data: function () {
      this.standardStepFire()
    },

    fireStep4Data: function () {
      this.standardStepFire()
    },

    fireStep5Data: function () {
      if (
        this.formStepData[this.formStep].patternNames.test(
          this.formStepData[this.formStep].firstName
        ) &&
        this.formStepData[this.formStep].patternNames.test(
          this.formStepData[this.formStep].lastName
        ) &&
        this.formStepData[this.formStep].patternZip.test(
          this.formStepData[this.formStep].zipCode
        )
      ) {
        axios
          .get(
            "https://maps.googleapis.com/maps/api/geocode/json?address=" +
              this.formStepData[5].zipCode +
              "&key=AIzaSyB-tH8jD9dvfm8RaijJmjKt2K5XuEJkUcA"
          )
          .then(function (response) {
            console.log(response)
            var responseArray = response.data.results[0].address_components
            responseArray.map(function (item) {
              var types = item.types

              types.map(function (type) {
                if (type === "locality") {
                  vm.city = item.short_name
                } else if (type === "neighborhood") {
                  vm.city = item.short_name
                } else if (type === "administrative_area_level_1") {
                  vm.stateAbbreviation = item.short_name
                }
              })
            })

            vm.stateZipCode = vm.formStepData[5].zipCode
            vm.formStep++
            vm.showError = false
          })
          .catch(function (error) {
            vm.showError = true
            console.log(error)
          })
      } else {
        this.showError = true
      }
    },

    fireStep6Data: function () {
      if (
        this.formStepData[this.formStep].patternPhone.test(
          this.formStepData[this.formStep].phoneNumber
        ) &&
        this.formStepData[this.formStep].patternEmail.test(
          this.formStepData[this.formStep].emailAddress
        )
      ) {
        this.finalObject = {
          firstName: this.formStepData[5].firstName,
          lastName: this.formStepData[5].lastName,
          phoneNumber: this.formStepData[6].phoneNumber,
          emailAddress: this.formStepData[6].emailAddress,
          city: this.city,
          zipCode: this.stateZipCode,
          state: this.stateAbbreviation,
          illOrDeceased: this.formStepData[0].value,
          haveWill: this.formStepData[1].value,
          originalWillPossession: this.formStepData[2].value,
          whatAssets: this.formStepData[3].value.join(", "),
          assetTotalAmount: this.formStepData[4].value,
        }

        console.log(this.finalObject)

        axios({
          method: "post",
          url: this.endPointURL,
          data: this.finalObject,
        })
          .then(function (response) {
            console.log(response)
          })
          .catch(function (error) {
            console.log(error)
          })

        this.formStep++
        this.showError = false
        this.showConfirmation = false

        setTimeout(function () {
          var headlineSection = document.querySelector(
            ".main-content__headline-section"
          )
          headlineSection.parentNode.removeChild(headlineSection)
          vm.showButton = false
        }, 400)
      } else {
        this.showError = true
      }
    },

    resetError: function () {
      this.showError = false
    },

    onSelectRadio: function (event) {
      this.formStepData[this.formStep].value = event.target.value
      this.resetError()
    },

    scrollToTop: function () {
      window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth",
      })
    },
  },
})
