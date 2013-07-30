var sum_to= function sum_to_(n){
    if(n == 1) return 1;
    else return n*n - sum_to(n-1);
}
