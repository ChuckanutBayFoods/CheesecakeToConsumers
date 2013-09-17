package cheesecaketoconsumers

import org.apache.commons.io.filefilter.AgeFileFilter;

class SaleItem {

    static constraints = {
		quantity range: 1..8
    }
	static belongsTo = [sale : Sale]
	
	Product product
	int quantity
}
