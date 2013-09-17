import grails.converters.JSON
import cheesecaketoconsumers.Product

class BootStrap {

    def init = { servletContext ->
		// Create a custom object marshaller so that we avoid outputting "class" and so we incldue the image urls:
		// http://kylewbanks.com/post/show/Customizing-JSON-Grails-Object-Marshalling
		// http://compiledammit.com/2012/08/16/custom-json-marshalling-in-grails-done-right/
		// http://manbuildswebsite.com/2010/02/15/rendering-json-in-grails-part-3-customise-your-json-with-object-marshallers
		JSON.registerObjectMarshaller(Product) {
			return [
				id : it.id,
				isActive : it.isActive,
				name : it.name,
				description : it.description,
				allergens : it.allergens,
				ingredients : it.ingredients,
				isGlutenFree : it.isGlutenFree,
				isNoSugarAdded : it.isNoSugarAdded,
				stageImageUrl : it.stageImageUrl,
				bareImageUrl : it.bareImageUrl,
				nutritionLabelImageUrl : it.nutritionLabelImageUrl
			]
		}
    }
    def destroy = {
    }
}
