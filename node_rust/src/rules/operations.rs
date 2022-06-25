pub fn pow(x: i32, y: i32) -> i32 {
    x.pow(y.try_into().unwrap())
}
