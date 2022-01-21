const  QSpinnerFacebook = require('quasar')
const Loading = Loading||function() {
   return {
     showLoading: function (){
       /* This is for Codepen (using UMD) to work */
       const spinner = typeof QSpinnerFacebook !== 'undefined'
         ? QSpinnerFacebook // Non-UMD, imported above
         : Quasar.components.QSpinnerFacebook // eslint-disable-line
       /* End of Codepen workaround */

       this.$q.loading.show({
         spinner,
         spinnerColor: 'yellow',
         spinnerSize: 140,
         backgroundColor: 'purple',
         message: 'Some important process is in progress. Hang on...',
         messageColor: 'black'
       })
     },
     closeLoading: function (){
       this.$q.loading.hide()
     }
   }
};
module.exports = {Loading:Loading}
