# 最小二乘法

import numpy as np
import matplotlib.pyplot as plt

x = [4.0, 4.2, 4.5, 4.7, 5.1, 5.5, 5.9, 6.3, 6.8, 7.1]
ys = [102.56, 113.18, 130.11, 142.05, 167.53, 195.14, 224.87, 256.73, 299.50, 326.72]
y = [np.log(i) for i in ys]

n_1 = 3
n_2 = 4


def phi_i(x, i):
    return [x[j] ** i for j in range(len(x))]


def get_Y(y, x, n):
    return [np.dot(y, phi_i(x, i)) for i in range(n)]


def get_G(x, n):
    G = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            G[i][j] = np.dot(phi_i(x, i), phi_i(x, j))
    return G


def get_p(ys, x, n):
    Y = np.array(get_Y(ys, x, n))
    G = get_G(x, n)
    cond_number = np.linalg.cond(G)  # 条件数计算
    print("条件数为:", cond_number)
    try:
    # 求解线性方程组 Gc = Y
        c = np.linalg.solve(G, Y)
        p = np.poly1d(c[::-1])  
        print("求解得到的向量 c 为:", c)
    except np.linalg.LinAlgError:
        print("系数矩阵 G 是奇异矩阵，无法求解线性方程组。")
        p = np.poly1d([0])
        c = np.zeros(n)

    return p, c


p_1, c_1 = get_p(ys, x, n_1)
p_2, c_2 = get_p(ys, x, n_2)
x_vals = np.linspace(min(x), max(x), 200)
y1_vals = p_1(x_vals)
y2_vals = p_2(x_vals)
plt.plot(x_vals, y1_vals, label='Fitted Polynomial n=3', color='blue')
plt.plot(x_vals, y2_vals, label='Fitted Polynomial n=4', color='green')



# 绘制数据点和多项式函数

plt.scatter(x, ys, label='Data Points', color='red')
plt.xlabel('x')
plt.ylabel('y')
plt.title('Data Points and Polynomial Function')
plt.legend()
plt.grid(True)
plt.show()


p ,c = get_p(y, x, 2)
b = c[1]
a = np.exp(c[0])
def fx(x):
    return a*np.exp(b*x)

y_valss = fx(x_vals)
plt.plot(x_vals, y_valss, label='ae^b Function', color='orange')
plt.scatter(x, ys, label='Data Points', color='red')
plt.xlabel('x')
plt.ylabel('y')
plt.title('Data Points and Function')
plt.legend()
plt.grid(True)
plt.show()