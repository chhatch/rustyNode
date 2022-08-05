use magnus::{
    define_global_function,
    encoding::{CType, EncodingCapable, RbEncoding},
    function,
    prelude::*,
    Error, RString,
};

extern crate serde_json;
mod rules;

#[magnus::init]
fn init() -> Result<(), Error> {
    define_global_function("rules", magnus::function!(rules::run, 1));
    Ok(())
}
