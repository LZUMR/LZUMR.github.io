# 公共序列问题
print("直接输入序列（由大写字母组成），例如：AGCGT")
X0 = input("请输入序列X: ")
Y0 = input("请输入序列Y: ")

X = [char for char in X0]
Y = [char for char in Y0]

def lcs(X, Y):
    m = len(X)
    n = len(Y)
    c = [[0 for _ in range(n+1)] for _ in range(m+1)]
    b = [[None for _ in range(n+1)] for _ in range(m+1)]  # 记录方向
    for i in range(1, m+1):
        for j in range(1, n+1):
            if X[i-1] == Y[j-1]:
                c[i][j] = c[i-1][j-1] + 1
                b[i][j] = 'xie'
            elif c[i-1][j] >= c[i][j-1]:
                c[i][j] = c[i-1][j]
                b[i][j] = 'shang'
            else:
                c[i][j] = c[i][j-1]
                b[i][j] = 'zuo'
    # 回溯求公共序列
    def find(b, X, i, j):
        seq = []
        while i > 0 and j > 0:
            if b[i][j] == 'xie':
                seq.append(X[i-1])
                i -= 1
                j -= 1
            elif b[i][j] == 'shang':
                i -= 1
            else:
                j -= 1
        return seq[::-1]
    Both = find(b, X, m, n)
    return c[m][n], Both


length, both = lcs(X, Y)
both = ''.join(both)
print("公共序列长度:", length)
print("公共序列:", both)
input("按回车退出")

