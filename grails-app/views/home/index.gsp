<!DOCTYPE html>
<html>
<head>
    <!-- Edit this later -->
    <title>Cheesecake to Consumers</title>
    <link rel="shortcut icon" href="../img/favicon.ico">
    <r:require modules="core"/>
    <r:layoutResources/>
</head>
<body>
    <header>
        <div class="content container">
            <div class="row">
                <span class="span4"><img src="../img/logos/chuckanutbaylogo-small.png"/></span>
                <span class="span4 free-shipping"><span>Free Overnight Shipping</span></span>
                <span class="span4 questions">
                    <a href="#">Questions?</a>
                    <div class="hide questions-content">
                        <div class="question">How big is each cheesecake?</div>
                        <div class="answer">Each cheesecake is 3" (4oz). This is enough for a full dessert or enough for two people looking for a small treat to share. Each box comes with 8 cheesecakes.</div>

                        <div class="question">Do my cheesecakes have to be refrigerated?</div>
                        <div class="answer">Yes, the cheesecakes must be refrigerated. They will last 10 days in the fridge. They can last over a year in the freezer. Just make sure to thaw them before consuming them.</div>

                        <div class="question">Where else can I order Chuckanut Bay Cheesecakes?</div>
                        <div class="answer">You can find grocery stores and markets that carry our products using our <a href="http://www.chuckanutbay.com/store-locator">Store Locator</a> tool.</div>

                        <div class="question">Are any Chuckanut Bay Cheesecakes gluten free?</div>
                        <div class="answer">Chuckanut Bay is proud to offer a number of gluten-free flavors. Not all flavors are gluten-free. Gluten-free flavors are noted with a gluten-free icon.</div>

                    </div>
                </span>
            </div>
        </div>
    </header>
    <div id="side-nav">
        <div class="selected" data-section="pick">
            <span class="section-label">Pick</span><span class="dot"></span>
        </div>
        <div class="disabled" data-section="personalize">
            <span class="section-label">Personalize</span><span class="dot"></span>
        </div>
        <div class="disabled" data-section="pack">
            <span class="section-label">Pack</span><span class="dot"></span>
        </div>
        <div class="disabled" data-section="pay">
            <span class="section-label">Pay</span><span class="dot"></span>
        </div>
    </div>
    <section id="pick">
        <h1>Pick your Flavors</h1>
        <h2>Mix-and-Match from all 20 flavors</h2>
        <div id="product-price">
            <div class="price">
                $49.99<span class="free-shipping-label"> + Free Shipping</span>
            </div>
            <div class="product">
                8 Single-Serve 3" Handmade Cheesecakes
            </div>
        </div>
        <div id="flavor-carousel">
            <div class="arrow-left"></div>
            <div class="arrow-right"></div>
            <div class="well">
                <ul class="scroll">
                </ul>
                <div class="arrow"></div>
            </div>
            <div class="carrot-container">
                <div class="outer-carrot"></div>
                <div class="inner-carrot"></div>
            </div>
            <div id="hidden-image-loading-container" style="display: none;"></div>
        </div>
        <div id="selected-cheesecake-btns" class="btn-container">
            <div class="btn btn-more-info">More info</div>
            <div class="btn btn-success btn-add">Add to Box</div>
        </div>
    </section>
    <section id="personalize" class="transparent hide">
        <h1>Personalize Gift Message</h1>
    </section>
    <section id="pack" class="transparent hide">
        <h1>Set Shipping Address</h1>
    </section>
    <section id="pay" class="transparent hide">
        <h1>Checkout and Pay</h1>
    </section>
    <section id="order-complete" class="transparent hide">
        <h1>Thank you for your order!</h1>
        <div class="summary">An email confirming your order will be sent to
            <span class="email"></span> and <br>
            <span class="recipient"></span> will receive the handmade cheesecakes on
            <span class="delivery-date"></span>.
        </div>
    </section>
    <div id="overflow-killer">
        <div id="box-container-wrapper">
            <div id="box-container">
                <div id="shield1" class="shield"></div>
                <div id="shield2" class="shield"></div>
                <div id="tray1" class="tray">
                    <img class="back tray-part" src="../img/tray/back.png">
                    <img class="mid tray-part" src="../img/tray/mid.png">
                    <img class="front tray-part" src="../img/tray/front.png">
                </div>
                <div id="tray2" class="tray">
                    <img class="back tray-part" src="../img/tray/back.png">
                    <img class="mid tray-part" src="../img/tray/mid.png">
                    <img class="front tray-part" src="../img/tray/front.png">
                </div>
                <div id="styro-container" class="hide">
                    <img class="styro front" src="../img/styro/front.png">
                    <p class="styro front styro-label">Keep Refrigerated</p>
                    <img class="styro left" src="../img/styro/left.png">
                    <img class="styro top" src="../img/styro/top.png">
                    <img class="styro back" src="../img/styro/back.png">
                    <img class="styro right" src="../img/styro/right.png">
                    <img class="styro base" src="../img/styro/base.png">
                </div>
                <div id="gift-message" class="hide">
                    <div class="info">
                        <h3>All Natural Ingredients</h3>
                        <p>These cheesecakes were handmade in the beautiful pacific northwest by Chuckanut Bay Foods.</p>
                        <p>Here is more info about the cheesecakes you have been given:</p>
                        <div class="flavor-info-container"></div>
                        <div class="logo-container"><img src="../img/logos/chuckanutbaylogo-medium.png"/></div>
                    </div><div class="message">
                        <h1>A Gift for You!</h1>
                        <div class="non-edit">
                            <pre>
My dearest,

I hope you enjoy this all natural delicious dessert.

Love,
Your secret admirer</pre>
                            <a href="#" class="edit-message-label right-aligned">Edit Message</a>
                        </div>
                        <div class="edit hide">
                            <textarea maxlength="350" rows="10"></textarea>
                            <span class='btn btn-success btn-save right-aligned'>Save</span>
                            <span class="max-characters-label right-aligned">350 characters max</span>
                        </div>
                        <img class="ingredients" src="../img/ingredients.png"/>
                        <span class="refrigerate-label">Refrigerate Immediately</span>
                    </div><div class="cover">
                        <p class="handmade-cheesecakes">8 Handmade Cheesecakes</p>
                        <img class="cheesecake-plated" src="../img/cheesecake-plated.png"/>
                        <img class="logo-cover" src="../img/logos/chuckanutbaylogo-narrow-medium.png"/>
                    </div>
                </div>
                <div id="complete-package">
                    <div id="box" class="slide-down hide">
                        <img class="box-part back" src="../img/box/back.png">
                        <img class="box-part front" src="../img/box/front.png">
                        <img class="box-part flaps" src="../img/box/flaps.png">
                        <img class="box-part top transparent" src="../img/box/top.png">
                        <img class="box-part tape transparent" src="../img/box/tape.png">
                    </div>
                    <div id="label" class="slide-down hide">
                        <form action="/" method="post" autocomplete="on" id="pack-form">
                            <div class="return-address">
                                Chuckanut Bay Foods<br>
                                5501 Hovander Rd #1<br>
                                Ferndale, WA 98248
                            </div>
                            <div class="ship-to-wrapper">
                                <div class="ship-to-label">SHIP TO:</div>
                                <pre class="ship-to hide"></pre>
                                <div>
                                    <input autocomplete="on" class="name" name="name" type="text" placeholder="Recipient Name"/><br>
                                    <input autocomplete="on" class="company" name="company" type="text" placeholder="Company (optional)"/><br>
                                    <input autocomplete="on" class="address" name="addressLine1" type="text" placeholder="Address"/><br>
                                    <input autocomplete="on" class="address2" name="addressLine2" type="text" placeholder="Address 2 (optional)"/><br>
                                    <input autocomplete="on" class="city" name="city"type="text" placeholder="City"/>
                                    <input autocomplete="on" class="state" name="state" type="text" placeholder="State" maxlength="2" />
                                    <input autocomplete="on" class="zip" name="zip" type="text" placeholder="Zip" maxlength="5" />
                                </div>
                            </div>
                            <div class="date-picker-wrapper">
                                <div class="date-picker-label">
                                    Deliver on:
                                </div>
                                <input type="text" name="arrival-date" id="datepicker" />
                                <div class="deliver-date hide"></div>
                            </div>
                            <div class="shipping-constraints">
                                Orders placed after 1:00PM PST cannot be shipped until next day.<br>
                                Orders can only be scheduled for arrival on a Tue, Wed, Thur, or Fri.
                            </div>
                            <div class="next-day-wrapper">
                                <div class="two-d-barcode-wrapper">
                                    <img class="box-part back" src="../img/label/2dbarcode.png">
                                </div>
                                <div class="next-day-label-wrapper">
                                    <div class="next-day-label">
                                        UPS Next-Day Air
                                    </div>
                                    <div class="freshness-label">
                                        For maximum freshness
                                    </div>
                                </div>
                            </div>
                            <div class="barcode-wrapper">
                                <img class="box-part back" src="../img/label/barcode.png">
                            </div>
                        </form>
                    </div>
                </div>
                <div id="checkout-window" class="transparent hide">
                    <div class="confirm">
                        <h3>Your Order</h3>
                        <p>8 Handmade Cheesecakes:</p>
                        <ul class="flavor-quantities"></ul>
                        <div class="grand-total">$49.99<span class="total-label"> includes tax and shipping</span></div>
                        <div class="ship-to"></div>
                    </div>
                    <div class="pay">
                        <h3>Billing Info</h3>
                        <form action="/" method="post" id="pay-form">

                            <div class="form-row">
                                <label for="name" class="stripeLabel">Your Name</label>
                                <input type="text" autocomplete="on" placeholder="Your Name" name="name" class="name required" />
                            </div>

                            <div class="form-row">
                                <label for="email">E-mail Address</label>
                                <input type="text" autocomplete="on" placeholder="Your Email" name="email" class="email required" />
                            </div>

                            <div class="form-row">
                                <label>Card Number</label>
                                <input type="text" placeholder="&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull;" maxlength="20" autocomplete="off" class="card-number stripe-sensitive required" />
                            </div>

                            <div class="form-row">
                                <label>CVC</label>
                                <input type="text" maxlength="4" autocomplete="off" class="card-cvc stripe-sensitive required" />
                            </div>

                            <div class="form-row">
                                <label>Expiration</label>
                                <div class="expiry-wrapper">
                                    <select class="card-expiry-month stripe-sensitive required">
                                    </select>
                                    <span> / </span>
                                    <select class="card-expiry-year stripe-sensitive required"></select>
                                </div>
                            </div>

                            <button type="submit" class="btn btn-success btn-order" name="submit-button">Place Order</button>
                            <div class="loading">
                                <div class="loading-ball-1"></div>
                                <div class="loading-ball-2"></div>
                                <div class="loading-ball-3"></div>
                                <div class="loading-ball-4"></div>
                                <div class="loading-ball-5"></div>
                                <div class="gradient-overlay"></div>
                            </div>
                            <div class="payment-errors alert alert-error hide"></div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="more-info" class="modal hide fade">
        <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h3></h3>
        </div>
        <div class="modal-body">
            <img class="staged-image" />
            <div class="text">
                <p class="description"></p>
                <p class="ingredients"></p>
                <p class="allergens"></p>
            </div>
            <img class="nutrition-label hide" />
        </div>
        <div class="modal-footer">
            <a href="#" class="btn btn-show-nutrition-label">Show Nutrition Label</a>
            <a href="#" class="btn" data-dismiss="modal">Close</a>
        </div>
    </div>
    <div id="truck" class="slide-right hide">
        <img src="../img/truck.png" />
    </div>
    <footer class="pick slide-down">
        <div class="next-prompt">Personalize gift message</div>
        <div class="continue-prompt">Click/tap here or scroll/swipe to continue.</div>
    </footer>
    <footer class="personalize slide-down">
        <div class="next-prompt">Proceed to Shipping and Packing</div>
        <div class="continue-prompt">Click/tap here or scroll/swipe to continue.</div>
    </footer>
    <footer class="pack slide-down">
        <div class="next-prompt">Proceed to Payment</div>
        <div class="continue-prompt">Click/tap here or scroll/swipe to continue.</div>
    </footer>
    <footer class="order-complete slide-down">
        <div class="next-prompt">Give more Cheesecakes</div>
        <div class="continue-prompt">Click/tap here or scroll/swipe to start another order.</div>
    </footer>
    <r:layoutResources/>
</body>
</html>